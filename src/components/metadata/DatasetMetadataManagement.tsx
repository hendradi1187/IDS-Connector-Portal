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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Database,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Download,
  MapPin,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import AddDatasetDialog from './AddDatasetDialog';
import EditDatasetDialog from './EditDatasetDialog';
import { getDatasets } from '@/lib/actions/datasetActions';

interface Dataset {
  id: string;
  name: string;
  owner: string;
  ownerType: 'KKKS' | 'SKK_MIGAS' | 'VENDOR';
  location: string;
  locationType: 'URL' | 'STORAGE' | 'API';
  format: string;
  dataType: 'SEISMIC' | 'WELL' | 'PRODUCTION' | 'GEOLOGICAL';
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  accessLevel: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
  lastValidation: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW';
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

const qualityVariants = {
  EXCELLENT: 'default',
  GOOD: 'secondary',
  FAIR: 'outline',
  POOR: 'destructive',
} as const;

const accessVariants = {
  PUBLIC: 'default',
  RESTRICTED: 'secondary',
  INTERNAL: 'outline',
} as const;

const statusVariants = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  PENDING_REVIEW: 'outline',
} as const;

export default function DatasetMetadataManagement() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterOwner, setFilterOwner] = useState<string>('');
  const [filterAccess, setFilterAccess] = useState<string>('');
  const { user } = useAuth();

  // RBAC: Define permissions
  const canCreate = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const canEdit = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const canDelete = user?.role === 'Admin';
  const canViewAll = user?.role === 'Admin';

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);

      const result = await getDatasets({
        searchTerm,
        dataType: filterType,
        ownerType: filterOwner,
        accessLevel: filterAccess
      });

      if (result.success) {
        setDatasets(result.data as Dataset[]);
      } else {
        console.error('Error fetching datasets:', result.error);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || filterType === 'ALL' || dataset.dataType === filterType;
    const matchesOwner = !filterOwner || filterOwner === 'ALL' || dataset.ownerType === filterOwner;
    const matchesAccess = !filterAccess || filterAccess === 'ALL' || dataset.accessLevel === filterAccess;

    return matchesSearch && matchesType && matchesOwner && matchesAccess;
  });

  const getQualityIcon = (quality: Dataset['quality']) => {
    switch (quality) {
      case 'EXCELLENT':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'GOOD':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'FAIR':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'POOR':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getLocationIcon = (type: Dataset['locationType']) => {
    switch (type) {
      case 'URL':
        return <FileText className="h-4 w-4" />;
      case 'STORAGE':
        return <Database className="h-4 w-4" />;
      case 'API':
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                Dataset Metadata Management
              </CardTitle>
              <CardDescription>
                Kelola informasi metadata lengkap untuk setiap dataset dalam sistem.
              </CardDescription>
            </div>
            {canCreate && <AddDatasetDialog />}
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search datasets, owners, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Data Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="SEISMIC">Seismic</SelectItem>
                  <SelectItem value="WELL">Well</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                  <SelectItem value="GEOLOGICAL">Geological</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterOwner} onValueChange={setFilterOwner}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Owner Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Owners</SelectItem>
                  <SelectItem value="KKKS">KKKS</SelectItem>
                  <SelectItem value="SKK_MIGAS">SKK Migas</SelectItem>
                  <SelectItem value="VENDOR">Vendor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAccess} onValueChange={setFilterAccess}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Access Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Access</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="RESTRICTED">Restricted</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dataset</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredDatasets.map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{dataset.name}</div>
                        <div className="text-sm text-muted-foreground">{dataset.description}</div>
                        <div className="flex gap-1">
                          {dataset.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {dataset.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{dataset.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{dataset.owner}</div>
                        <Badge variant="outline" className="text-xs">
                          {dataset.ownerType.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-[200px]">
                        {getLocationIcon(dataset.locationType)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono truncate" title={dataset.location}>
                            {dataset.location}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {dataset.locationType}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{dataset.format}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getQualityIcon(dataset.quality)}
                        <Badge variant={qualityVariants[dataset.quality]}>
                          {dataset.quality}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={accessVariants[dataset.accessLevel]}>
                        {dataset.accessLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[dataset.status]}>
                        {dataset.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(dataset.updatedAt).toLocaleDateString('id-ID')}
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
                            <Download className="h-4 w-4 mr-2" />
                            Download Metadata
                          </DropdownMenuItem>
                          {canEdit && (
                            <>
                              <DropdownMenuSeparator />
                              <EditDatasetDialog dataset={dataset}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </EditDatasetDialog>
                            </>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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

          {!loading && filteredDatasets.length === 0 && (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || (filterType && filterType !== 'ALL') || (filterOwner && filterOwner !== 'ALL') || (filterAccess && filterAccess !== 'ALL')
                  ? 'No datasets found matching your filters.'
                  : 'No datasets found. Add your first dataset to get started.'}
              </p>
              {canCreate && !searchTerm && (!filterType || filterType === 'ALL') && (!filterOwner || filterOwner === 'ALL') && (!filterAccess || filterAccess === 'ALL') && (
                <AddDatasetDialog asChild>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dataset
                  </Button>
                </AddDatasetDialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}