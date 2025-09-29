'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api/client';
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Route,
  ArrowRight,
  Shield,
  Activity,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { DataRoute, DistributionLog } from '@/lib/types';

export default function DataFlowRoutingManagement() {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<DataRoute[]>([]);
  const [logs, setLogs] = useState<DistributionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<DataRoute | null>(null);
  const [formData, setFormData] = useState({
    providerId: '',
    consumerId: '',
    resourceId: '',
    validUntil: '',
    status: 'active'
  });

  // Mock data untuk industri migas - sesuai dengan database schema
  const mockRoutes: DataRoute[] = [
    {
      id: '1',
      providerId: 'provider-1',
      consumerId: 'consumer-1',
      resourceId: 'resource-1',
      status: 'active',
      validUntil: '2025-12-31T23:59:59Z',
      createdAt: '2024-01-15T10:30:00Z',
      provider: {
        id: 'provider-1',
        name: 'Pertamina Hulu Energi',
        organization: 'KKKS'
      },
      consumer: {
        id: 'consumer-1',
        name: 'SKK Migas',
        organization: 'Government'
      },
      resource: {
        id: 'resource-1',
        name: 'Data GeoJSON Blok Mahakam',
        type: 'GeoJSON',
        description: 'Peta geografis blok eksplorasi Mahakam'
      }
    },
    {
      id: '2',
      providerId: 'provider-2',
      consumerId: 'consumer-1',
      resourceId: 'resource-2',
      status: 'active',
      validUntil: '2025-06-30T23:59:59Z',
      createdAt: '2024-01-10T08:15:00Z',
      provider: {
        id: 'provider-2',
        name: 'Chevron Indonesia',
        organization: 'KKKS'
      },
      consumer: {
        id: 'consumer-1',
        name: 'SKK Migas',
        organization: 'Government'
      },
      resource: {
        id: 'resource-2',
        name: 'Data Produksi Harian Rokan',
        type: 'CSV',
        description: 'Data produksi minyak dan gas harian'
      }
    },
    {
      id: '3',
      providerId: 'provider-3',
      consumerId: 'consumer-2',
      resourceId: 'resource-3',
      status: 'inactive',
      validUntil: '2024-01-15T23:59:59Z',
      createdAt: '2023-12-01T14:20:00Z',
      provider: {
        id: 'provider-3',
        name: 'ExxonMobil Cepu',
        organization: 'KKKS'
      },
      consumer: {
        id: 'consumer-2',
        name: 'Kementerian ESDM',
        organization: 'Government'
      },
      resource: {
        id: 'resource-3',
        name: 'Laporan Lingkungan Blok Cepu',
        type: 'Well Data',
        description: 'Laporan monitoring lingkungan operasi'
      }
    }
  ];

  const mockLogs: DistributionLog[] = [
    {
      id: '1',
      routeId: 'RT-001',
      timestamp: '2024-01-21T15:45:00Z',
      status: 'success',
      dataSize: '2.3 MB',
      consumer: 'SKK Migas'
    },
    {
      id: '2',
      routeId: 'RT-002',
      timestamp: '2024-01-21T09:30:00Z',
      status: 'success',
      dataSize: '856 KB',
      consumer: 'SKK Migas'
    },
    {
      id: '3',
      routeId: 'RT-001',
      timestamp: '2024-01-20T15:45:00Z',
      status: 'error',
      dataSize: '2.1 MB',
      consumer: 'SKK Migas',
      errorMessage: 'Network timeout during transfer'
    },
    {
      id: '4',
      routeId: 'RT-003',
      timestamp: '2024-01-14T16:45:00Z',
      status: 'success',
      dataSize: '15.2 MB',
      consumer: 'Kementerian ESDM'
    }
  ];

  useEffect(() => {
    fetchRoutes();
    fetchLogs();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use mock data for demo - API is too slow
      setRoutes(mockRoutes);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes(mockRoutes);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      // Mock implementation - in real app would fetch from logs API
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs(mockLogs);
    }
  };

  const handleCreate = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new route with mock data
      const newRoute: DataRoute = {
        id: `route-${Date.now()}`,
        providerId: formData.providerId,
        consumerId: formData.consumerId,
        resourceId: formData.resourceId,
        status: formData.status as 'active' | 'inactive',
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        createdAt: new Date().toISOString(),
        provider: {
          id: formData.providerId,
          name: getProviderName(formData.providerId),
          organization: 'KKKS'
        },
        consumer: {
          id: formData.consumerId,
          name: getConsumerName(formData.consumerId),
          organization: 'Government'
        },
        resource: {
          id: formData.resourceId,
          name: getResourceName(formData.resourceId),
          type: getResourceType(formData.resourceId),
          description: 'New resource data'
        }
      };

      // Add to routes state
      setRoutes(prev => [newRoute, ...prev]);

      toast({
        title: "Success",
        description: "Data route created successfully"
      });
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating route:', error);
      toast({
        title: "Error",
        description: "Failed to create data route",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedRoute) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update route in state
      setRoutes(prev => prev.map(route =>
        route.id === selectedRoute.id
          ? {
              ...route,
              providerId: formData.providerId,
              consumerId: formData.consumerId,
              resourceId: formData.resourceId,
              status: formData.status as 'active' | 'inactive',
              validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
            }
          : route
      ));

      toast({
        title: "Success",
        description: "Data route updated successfully"
      });
      setIsEditOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        title: "Error",
        description: "Failed to update data route",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this data route?')) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove route from state
      setRoutes(prev => prev.filter(route => route.id !== id));

      toast({
        title: "Success",
        description: "Data route deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        title: "Error",
        description: "Failed to delete data route",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      providerId: '',
      consumerId: '',
      resourceId: '',
      validUntil: '',
      status: 'active'
    });
    setSelectedRoute(null);
  };

  const openEditDialog = (route: DataRoute) => {
    setSelectedRoute(route);
    setFormData({
      providerId: route.providerId,
      consumerId: route.consumerId,
      resourceId: route.resourceId,
      validUntil: route.validUntil ? route.validUntil.split('T')[0] : '',
      status: route.status
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active', icon: CheckCircle, color: 'text-green-600' },
      inactive: { variant: 'secondary' as const, label: 'Inactive', icon: XCircle, color: 'text-gray-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const getResourceTypeBadge = (type: string) => {
    const typeConfig = {
      GeoJSON: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      CSV: { variant: 'secondary' as const, color: 'bg-green-100 text-green-800' },
      'Well Data': { variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.CSV;
    return <Badge variant={config.variant} className={config.color}>{type}</Badge>;
  };

  // Helper functions to get names by ID
  const getProviderName = (id: string) => {
    const providers = {
      'KKKS-001': 'Pertamina Hulu Energi',
      'KKKS-002': 'Chevron Indonesia',
      'KKKS-003': 'ExxonMobil Cepu',
      'KKKS-004': 'BP Tangguh',
      'KKKS-005': 'Total E&P Indonesie'
    };
    return providers[id as keyof typeof providers] || 'Unknown Provider';
  };

  const getConsumerName = (id: string) => {
    const consumers = {
      'SKK-001': 'SKK Migas',
      'ENV-001': 'Kementerian ESDM',
      'REG-001': 'Ditjen Migas',
      'MON-001': 'BPMIGAS'
    };
    return consumers[id as keyof typeof consumers] || 'Unknown Consumer';
  };

  const getResourceName = (id: string) => {
    const resources = {
      'GEO-001': 'Data GeoJSON Peta Blok',
      'PROD-001': 'Data Produksi Harian',
      'WELL-001': 'Data Log Sumur',
      'ENV-001': 'Laporan Lingkungan',
      'FIN-001': 'Laporan Keuangan',
      'SAF-001': 'Laporan Keselamatan'
    };
    return resources[id as keyof typeof resources] || 'Unknown Resource';
  };

  const getResourceType = (id: string) => {
    const types = {
      'GEO-001': 'GeoJSON',
      'PROD-001': 'CSV',
      'WELL-001': 'Well Data',
      'ENV-001': 'Well Data',
      'FIN-001': 'CSV',
      'SAF-001': 'Well Data'
    };
    return types[id as keyof typeof types] || 'GeoJSON';
  };

  const activeRoutes = routes.filter(r => r.status === 'active').length;
  const inactiveRoutes = routes.filter(r => r.status === 'inactive').length;
  const expiredRoutes = routes.filter(r => r.validUntil && new Date(r.validUntil) < new Date()).length;
  const totalRoutes = routes.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Routes</p>
                <p className="text-2xl font-bold text-green-600">{activeRoutes}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Routes</p>
                <p className="text-2xl font-bold text-gray-600">{inactiveRoutes}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired Routes</p>
                <p className="text-2xl font-bold text-red-600">{expiredRoutes}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Routes</p>
                <p className="text-2xl font-bold text-blue-600">{totalRoutes}</p>
              </div>
              <Route className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="routes" className="w-full">
        <TabsList>
          <TabsTrigger value="routes">Data Routes</TabsTrigger>
          <TabsTrigger value="logs">Distribution Logs</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Data Flow Routes
                  </CardTitle>
                  <CardDescription>
                    Manage data routes between providers and consumers in oil & gas upstream operations
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchRoutes}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Route
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Data Route</DialogTitle>
                        <DialogDescription>
                          Create a new data flow route between provider and consumer
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="providerId">Provider (KKKS)</Label>
                            <Select value={formData.providerId} onValueChange={(value) => setFormData({...formData, providerId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="KKKS-001">Pertamina Hulu Energi</SelectItem>
                                <SelectItem value="KKKS-002">Chevron Indonesia</SelectItem>
                                <SelectItem value="KKKS-003">ExxonMobil Cepu</SelectItem>
                                <SelectItem value="KKKS-004">BP Tangguh</SelectItem>
                                <SelectItem value="KKKS-005">Total E&P Indonesie</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="consumerId">Consumer</Label>
                            <Select value={formData.consumerId} onValueChange={(value) => setFormData({...formData, consumerId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select consumer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SKK-001">SKK Migas</SelectItem>
                                <SelectItem value="ENV-001">Kementerian ESDM</SelectItem>
                                <SelectItem value="REG-001">Ditjen Migas</SelectItem>
                                <SelectItem value="MON-001">BPMIGAS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="resourceId">Resource Data</Label>
                          <Select value={formData.resourceId} onValueChange={(value) => setFormData({...formData, resourceId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select resource" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GEO-001">Data GeoJSON Peta Blok</SelectItem>
                              <SelectItem value="PROD-001">Data Produksi Harian</SelectItem>
                              <SelectItem value="WELL-001">Data Log Sumur</SelectItem>
                              <SelectItem value="ENV-001">Laporan Lingkungan</SelectItem>
                              <SelectItem value="FIN-001">Laporan Keuangan</SelectItem>
                              <SelectItem value="SAF-001">Laporan Keselamatan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="validUntil">Valid Until</Label>
                            <Input
                              id="validUntil"
                              type="date"
                              value={formData.validUntil}
                              onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as 'active' | 'inactive'})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreate}>Create Route</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading routes...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route ID</TableHead>
                      <TableHead>Data Flow</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Transfers</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-mono font-medium">{route.id.substring(0, 8)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{route.provider.name}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{route.consumer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{route.resource.name}</div>
                            {getResourceTypeBadge(route.resource.type)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(route.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {route.validUntil ? new Date(route.validUntil).toLocaleDateString() : 'No expiry'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-bold text-lg">-</div>
                            <div className="text-xs text-muted-foreground">
                              No logs yet
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(route)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(route.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Distribution Logs
              </CardTitle>
              <CardDescription>
                Track all data transfer activities and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Route ID</TableHead>
                    <TableHead>Consumer</TableHead>
                    <TableHead>Data Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">{log.routeId}</TableCell>
                      <TableCell>{log.consumer}</TableCell>
                      <TableCell>{log.dataSize}</TableCell>
                      <TableCell>
                        {log.status === 'success' && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        )}
                        {log.status === 'error' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                        {log.status === 'pending' && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.errorMessage && (
                          <span className="text-sm text-red-600">{log.errorMessage}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Policy Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contract Compliance</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">98%</Badge>
                  </div>
                  <Progress value={98} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Policy Adherence</span>
                    <Badge variant="default" className="bg-blue-100 text-blue-800">95%</Badge>
                  </div>
                  <Progress value={95} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Broker Validation</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">92%</Badge>
                  </div>
                  <Progress value={92} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Route Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transfer Success Rate</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">97%</Badge>
                  </div>
                  <Progress value={97} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <span className="text-sm font-medium">2.3s</span>
                  </div>
                  <Progress value={77} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Integrity</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">99%</Badge>
                  </div>
                  <Progress value={99} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Data Route</DialogTitle>
            <DialogDescription>
              Update data flow route configuration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-providerId">Provider (KKKS)</Label>
                <Select value={formData.providerId} onValueChange={(value) => setFormData({...formData, providerId: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KKKS-001">Pertamina Hulu Energi</SelectItem>
                    <SelectItem value="KKKS-002">Chevron Indonesia</SelectItem>
                    <SelectItem value="KKKS-003">ExxonMobil Cepu</SelectItem>
                    <SelectItem value="KKKS-004">BP Tangguh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-consumerId">Consumer</Label>
                <Select value={formData.consumerId} onValueChange={(value) => setFormData({...formData, consumerId: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SKK-001">SKK Migas</SelectItem>
                    <SelectItem value="ENV-001">Kementerian ESDM</SelectItem>
                    <SelectItem value="REG-001">Ditjen Migas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-validUntil">Valid Until</Label>
                <Input
                  id="edit-validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}