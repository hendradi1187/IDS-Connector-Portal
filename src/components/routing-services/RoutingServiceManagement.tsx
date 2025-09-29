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
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, RefreshCw, Route, Play, Pause, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { RoutingService } from '@/lib/types';

export default function RoutingServiceManagement() {
  const { toast } = useToast();
  const [services, setServices] = useState<RoutingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<RoutingService | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    routingType: '',
    priority: '0',
    loadBalancing: '',
    healthCheck: '',
    configuration: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.routingServices.getAll();
      setServices(response || []);
    } catch (error) {
      console.error('Error fetching routing services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch routing services",
        variant: "destructive"
      });
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        routingType: formData.routingType,
        priority: parseInt(formData.priority),
        loadBalancing: formData.loadBalancing,
        healthCheck: formData.healthCheck ? JSON.parse(formData.healthCheck) : {},
        configuration: formData.configuration ? JSON.parse(formData.configuration) : {}
      };

      await apiClient.routingServices.create(data);
      toast({
        title: "Success",
        description: "Routing service created successfully"
      });
      setIsCreateOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error creating routing service:', error);
      toast({
        title: "Error",
        description: "Failed to create routing service",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedService) return;

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        routingType: formData.routingType,
        priority: parseInt(formData.priority),
        loadBalancing: formData.loadBalancing,
        healthCheck: formData.healthCheck ? JSON.parse(formData.healthCheck) : {},
        configuration: formData.configuration ? JSON.parse(formData.configuration) : {}
      };

      await apiClient.routingServices.update(selectedService.id, data);
      toast({
        title: "Success",
        description: "Routing service updated successfully"
      });
      setIsEditOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error updating routing service:', error);
      toast({
        title: "Error",
        description: "Failed to update routing service",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this routing service?')) return;

    try {
      await apiClient.routingServices.delete(id);
      toast({
        title: "Success",
        description: "Routing service deleted successfully"
      });
      fetchServices();
    } catch (error) {
      console.error('Error deleting routing service:', error);
      toast({
        title: "Error",
        description: "Failed to delete routing service",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      routingType: '',
      priority: '0',
      loadBalancing: '',
      healthCheck: '',
      configuration: ''
    });
    setSelectedService(null);
  };

  const openEditDialog = (service: RoutingService) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      routingType: service.routingType,
      priority: service.priority.toString(),
      loadBalancing: service.loadBalancing,
      healthCheck: JSON.stringify(service.healthCheck, null, 2),
      configuration: JSON.stringify(service.configuration, null, 2)
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active', icon: Play },
      inactive: { variant: 'secondary' as const, label: 'Inactive', icon: Pause },
      maintenance: { variant: 'outline' as const, label: 'Maintenance', icon: Pause },
      error: { variant: 'destructive' as const, label: 'Error', icon: Pause }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRoutingTypeBadge = (type: string) => {
    const typeConfig = {
      DIRECT: { variant: 'default' as const, label: 'Direct' },
      LOAD_BALANCED: { variant: 'secondary' as const, label: 'Load Balanced' },
      FAILOVER: { variant: 'outline' as const, label: 'Failover' },
      ROUND_ROBIN: { variant: 'outline' as const, label: 'Round Robin' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.DIRECT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const displayServices = services;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Routing Services
              </CardTitle>
              <CardDescription>
                Manage and monitor routing services and load balancing
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchServices}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Routing Service</DialogTitle>
                    <DialogDescription>
                      Configure a new routing service for load balancing and traffic management
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Service Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g., Primary Load Balancer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Input
                          id="priority"
                          type="number"
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Service description"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="routingType">Routing Type</Label>
                        <Select value={formData.routingType} onValueChange={(value) => setFormData({...formData, routingType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select routing type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DIRECT">Direct</SelectItem>
                            <SelectItem value="LOAD_BALANCED">Load Balanced</SelectItem>
                            <SelectItem value="FAILOVER">Failover</SelectItem>
                            <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loadBalancing">Load Balancing</Label>
                        <Select value={formData.loadBalancing} onValueChange={(value) => setFormData({...formData, loadBalancing: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select load balancing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                            <SelectItem value="WEIGHTED">Weighted</SelectItem>
                            <SelectItem value="LEAST_CONNECTIONS">Least Connections</SelectItem>
                            <SelectItem value="IP_HASH">IP Hash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="healthCheck">Health Check Configuration (JSON)</Label>
                      <Textarea
                        id="healthCheck"
                        value={formData.healthCheck}
                        onChange={(e) => setFormData({...formData, healthCheck: e.target.value})}
                        placeholder='{"enabled": true, "interval": 30, "timeout": 5}'
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="configuration">Service Configuration (JSON)</Label>
                      <Textarea
                        id="configuration"
                        value={formData.configuration}
                        onChange={(e) => setFormData({...formData, configuration: e.target.value})}
                        placeholder='{"maxConnections": 1000, "timeout": 30000}'
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate}>Create Service</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading routing services...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Load Balancing</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health Check</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">{service.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoutingTypeBadge(service.routingType)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.loadBalancing.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{service.priority}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell>
                      {service.healthCheck?.enabled ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
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

      {selectedService && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Service Details: {selectedService.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="health">Health Check</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Routing Type</Label>
                    <div className="mt-1">{getRoutingTypeBadge(selectedService.routingType)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Load Balancing</Label>
                    <p className="text-sm text-muted-foreground">{selectedService.loadBalancing.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <p className="text-sm text-muted-foreground">{selectedService.priority}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedService.status)}</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="configuration" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Service Configuration</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-auto">
                    {JSON.stringify(selectedService.configuration, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="health" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Health Check Configuration</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-auto">
                    {JSON.stringify(selectedService.healthCheck, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Connection Load</Label>
                    <Progress value={75} className="w-full" />
                    <p className="text-xs text-muted-foreground">750/1000 connections</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Response Time</Label>
                    <Progress value={45} className="w-full" />
                    <p className="text-xs text-muted-foreground">Average: 450ms</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Success Rate</Label>
                    <Progress value={98} className="w-full" />
                    <p className="text-xs text-muted-foreground">98.5% success rate</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Throughput</Label>
                    <Progress value={60} className="w-full" />
                    <p className="text-xs text-muted-foreground">600 req/sec</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Routing Service</DialogTitle>
            <DialogDescription>
              Update routing service configuration and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Service Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-routingType">Routing Type</Label>
                <Select value={formData.routingType} onValueChange={(value) => setFormData({...formData, routingType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIRECT">Direct</SelectItem>
                    <SelectItem value="LOAD_BALANCED">Load Balanced</SelectItem>
                    <SelectItem value="FAILOVER">Failover</SelectItem>
                    <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-loadBalancing">Load Balancing</Label>
                <Select value={formData.loadBalancing} onValueChange={(value) => setFormData({...formData, loadBalancing: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                    <SelectItem value="WEIGHTED">Weighted</SelectItem>
                    <SelectItem value="LEAST_CONNECTIONS">Least Connections</SelectItem>
                    <SelectItem value="IP_HASH">IP Hash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-healthCheck">Health Check Configuration (JSON)</Label>
              <Textarea
                id="edit-healthCheck"
                value={formData.healthCheck}
                onChange={(e) => setFormData({...formData, healthCheck: e.target.value})}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-configuration">Service Configuration (JSON)</Label>
              <Textarea
                id="edit-configuration"
                value={formData.configuration}
                onChange={(e) => setFormData({...formData, configuration: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}