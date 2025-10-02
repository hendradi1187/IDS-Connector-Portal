'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  Users,
  Lock,
  Unlock,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  UserCheck,
  UserX,
  Building,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface AccessControl {
  id: string;
  datasetName: string;
  datasetId: string;
  accessLevel: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
  allowedRoles: string[];
  allowedOrganizations: string[];
  specificUsers: string[];
  restrictions: {
    downloadAllowed: boolean;
    viewOnly: boolean;
    timeLimit?: string;
    ipRestriction?: string[];
  };
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  lastAccessed?: string;
  accessCount: number;
}

const accessLevelVariants = {
  PUBLIC: 'default',
  RESTRICTED: 'secondary',
  INTERNAL: 'outline',
} as const;

export default function AccessControlManagement() {
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const { user } = useAuth();

  const canManageAccess = user?.role === 'Admin';
  const canViewAll = user?.role === 'Admin' || user?.role === 'SKK-Consumer';

  useEffect(() => {
    fetchAccessControls();
  }, []);

  const fetchAccessControls = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAccessControls: AccessControl[] = [
        {
          id: '1',
          datasetName: 'Seismic Survey Lapangan Minas 2024',
          datasetId: 'ds-001',
          accessLevel: 'RESTRICTED',
          allowedRoles: ['Admin', 'KKKS-Provider'],
          allowedOrganizations: ['Chevron Pacific Indonesia', 'SKK Migas'],
          specificUsers: ['user1@chevron.com', 'analyst@skkmigas.go.id'],
          restrictions: {
            downloadAllowed: true,
            viewOnly: false,
            timeLimit: '90 days',
            ipRestriction: ['10.0.0.0/8', '192.168.1.0/24'],
          },
          grantedBy: 'admin@skkmigas.go.id',
          grantedAt: '2024-09-01T08:00:00Z',
          expiresAt: '2024-12-01T08:00:00Z',
          lastAccessed: '2024-09-25T14:30:00Z',
          accessCount: 47,
        },
        {
          id: '2',
          datasetName: 'Well Log Data Sumur Duri-001',
          datasetId: 'ds-002',
          accessLevel: 'PUBLIC',
          allowedRoles: ['Admin', 'KKKS-Provider', 'SKK-Consumer'],
          allowedOrganizations: ['All'],
          specificUsers: [],
          restrictions: {
            downloadAllowed: true,
            viewOnly: false,
          },
          grantedBy: 'system@skkmigas.go.id',
          grantedAt: '2024-08-15T09:00:00Z',
          lastAccessed: '2024-09-28T11:45:00Z',
          accessCount: 156,
        },
        {
          id: '3',
          datasetName: 'Production Data Lapangan Badak',
          datasetId: 'ds-003',
          accessLevel: 'INTERNAL',
          allowedRoles: ['Admin'],
          allowedOrganizations: ['SKK Migas'],
          specificUsers: ['director@skkmigas.go.id', 'head.data@skkmigas.go.id'],
          restrictions: {
            downloadAllowed: false,
            viewOnly: true,
            ipRestriction: ['203.142.0.0/16'],
          },
          grantedBy: 'admin@skkmigas.go.id',
          grantedAt: '2024-07-01T10:00:00Z',
          lastAccessed: '2024-09-27T16:20:00Z',
          accessCount: 23,
        },
        {
          id: '4',
          datasetName: 'Geological Map Cekungan Sumatera Tengah',
          datasetId: 'ds-004',
          accessLevel: 'RESTRICTED',
          allowedRoles: ['Admin', 'KKKS-Provider'],
          allowedOrganizations: ['Institut Teknologi Bandung', 'SKK Migas'],
          specificUsers: ['researcher@itb.ac.id'],
          restrictions: {
            downloadAllowed: true,
            viewOnly: false,
            timeLimit: '180 days',
          },
          grantedBy: 'admin@skkmigas.go.id',
          grantedAt: '2024-08-01T12:00:00Z',
          expiresAt: '2025-02-01T12:00:00Z',
          lastAccessed: '2024-09-20T09:15:00Z',
          accessCount: 12,
        },
      ];

      setAccessControls(mockAccessControls);
    } catch (error) {
      console.error('Error fetching access controls:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccessControls = accessControls.filter(ac => {
    const matchesSearch = ac.datasetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ac.allowedOrganizations.some(org =>
                           org.toLowerCase().includes(searchTerm.toLowerCase())
                         );

    const matchesLevel = !filterLevel || ac.accessLevel === filterLevel;
    const matchesRole = !filterRole || ac.allowedRoles.includes(filterRole);

    return matchesSearch && matchesLevel && matchesRole;
  });

  const getAccessIcon = (level: AccessControl['accessLevel']) => {
    switch (level) {
      case 'PUBLIC':
        return <Unlock className="h-4 w-4 text-green-600" />;
      case 'RESTRICTED':
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case 'INTERNAL':
        return <Lock className="h-4 w-4 text-red-600" />;
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Access Control Management
              </CardTitle>
              <CardDescription>
                Kelola hak akses dan izin untuk setiap dataset berdasarkan role dan organisasi.
              </CardDescription>
            </div>
            {canManageAccess && (
              <Button size="sm" className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Access Rule</span>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Access Rules</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessControls.length}</div>
            <p className="text-xs text-muted-foreground">
              Active access configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Datasets</CardTitle>
            <Unlock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {accessControls.filter(ac => ac.accessLevel === 'PUBLIC').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Open access datasets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restricted Access</CardTitle>
            <Shield className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {accessControls.filter(ac => ac.accessLevel === 'RESTRICTED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Limited access datasets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {accessControls.filter(ac => isExpiringSoon(ac.expiresAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Expiring in 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search datasets or organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Access Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="RESTRICTED">Restricted</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="KKKS-Provider">KKKS Provider</SelectItem>
                  <SelectItem value="SKK-Consumer">SKK Consumer</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Controls Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dataset</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Allowed Roles</TableHead>
                <TableHead>Organizations</TableHead>
                <TableHead>Restrictions</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredAccessControls.map((ac) => (
                  <TableRow key={ac.id}>
                    <TableCell>
                      <div className="font-medium">{ac.datasetName}</div>
                      <div className="text-sm text-muted-foreground">ID: {ac.datasetId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAccessIcon(ac.accessLevel)}
                        <Badge variant={accessLevelVariants[ac.accessLevel]}>
                          {ac.accessLevel}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {ac.allowedRoles.slice(0, 2).map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                        {ac.allowedRoles.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{ac.allowedRoles.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px]">
                        {ac.allowedOrganizations.includes('All') ? (
                          <Badge variant="outline" className="text-xs">All Organizations</Badge>
                        ) : (
                          <div className="space-y-1">
                            {ac.allowedOrganizations.slice(0, 2).map((org) => (
                              <div key={org} className="text-sm truncate" title={org}>
                                {org}
                              </div>
                            ))}
                            {ac.allowedOrganizations.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{ac.allowedOrganizations.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {!ac.restrictions.downloadAllowed && (
                          <Badge variant="outline" className="text-xs">No Download</Badge>
                        )}
                        {ac.restrictions.viewOnly && (
                          <Badge variant="outline" className="text-xs">View Only</Badge>
                        )}
                        {ac.restrictions.timeLimit && (
                          <Badge variant="outline" className="text-xs">{ac.restrictions.timeLimit}</Badge>
                        )}
                        {ac.restrictions.ipRestriction && (
                          <Badge variant="outline" className="text-xs">IP Restricted</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{ac.accessCount}</div>
                        <div className="text-muted-foreground">accesses</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ac.expiresAt ? (
                        <div className="text-sm">
                          <div className={`font-medium ${
                            isExpired(ac.expiresAt) ? 'text-red-600' :
                            isExpiringSoon(ac.expiresAt) ? 'text-yellow-600' :
                            'text-muted-foreground'
                          }`}>
                            {new Date(ac.expiresAt).toLocaleDateString('id-ID')}
                          </div>
                          {isExpired(ac.expiresAt) && (
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          )}
                          {isExpiringSoon(ac.expiresAt) && !isExpired(ac.expiresAt) && (
                            <Badge variant="outline" className="text-xs text-yellow-600">Expiring Soon</Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">No Expiry</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Access Log
                          </DropdownMenuItem>
                          {canManageAccess && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Access
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Extend Access
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <UserX className="h-4 w-4 mr-2" />
                                Revoke Access
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!loading && filteredAccessControls.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterLevel || filterRole
                  ? 'No access controls found matching your filters.'
                  : 'No access controls configured yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}