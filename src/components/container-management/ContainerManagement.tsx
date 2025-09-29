'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Play, Square, RotateCcw, Trash2, Plus, Activity, HardDrive, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Container } from '@/lib/types';

export default function ContainerManagement() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const { toast } = useToast();

  const [newContainer, setNewContainer] = useState({
    name: '',
    image: '',
    ports: '',
    volumes: '',
    environment: ''
  });

  useEffect(() => {
    loadContainers();
  }, []);

  const loadContainers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/containers');
      if (!response.ok) {
        throw new Error('Failed to fetch containers');
      }
      const containersData = await response.json();

      // Transform API data to match frontend interface
      const transformedContainers: Container[] = containersData.map((container: any) => ({
        id: container.id,
        name: container.serviceName,
        image: container.image,
        status: container.status,
        ports: container.ports || {},
        volumes: container.volumes || {},
        environment: container.environment || {},
        cpuUsage: container.cpuUsage || 0,
        memoryUsage: container.memoryUsage || 0,
        logs: container.logs || 'No logs available',
        createdAt: new Date(container.createdAt),
        updatedAt: new Date(container.updatedAt)
      }));

      setContainers(transformedContainers);
    } catch (error) {
      console.error('Error loading containers:', error);
      toast({
        title: "Error",
        description: "Failed to load containers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContainerAction = async (containerId: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    try {
      if (action === 'delete') {
        const response = await fetch(`/api/containers/${containerId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete container');
        }

        setContainers(prev => prev.filter(c => c.id !== containerId));
        toast({
          title: "Success",
          description: "Container deleted successfully"
        });
      } else {
        const response = await fetch(`/api/containers/${containerId}/actions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action })
        });

        if (!response.ok) {
          throw new Error(`Failed to ${action} container`);
        }

        const result = await response.json();

        // Update container status in local state
        const newStatus = action === 'start' || action === 'restart' ? 'running' : 'stopped';
        setContainers(prev => prev.map(c =>
          c.id === containerId
            ? { ...c, status: newStatus as any, updatedAt: new Date() }
            : c
        ));

        toast({
          title: "Success",
          description: `Container ${action}ed successfully`
        });
      }
    } catch (error) {
      console.error(`Error performing ${action} on container:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} container`,
        variant: "destructive"
      });
    }
  };

  const handleAddContainer = async () => {
    try {
      // Parse JSON fields
      let parsedPorts = {};
      let parsedVolumes = {};
      let parsedEnvironment = {};

      try {
        if (newContainer.ports) {
          parsedPorts = JSON.parse(`{${newContainer.ports}}`);
        }
        if (newContainer.volumes) {
          parsedVolumes = JSON.parse(`{${newContainer.volumes}}`);
        }
        if (newContainer.environment) {
          parsedEnvironment = JSON.parse(`{${newContainer.environment}}`);
        }
      } catch (parseError) {
        throw new Error('Invalid JSON format in configuration fields');
      }

      // Get admin user ID from API
      const userResponse = await fetch('/api/users?role=Admin');
      const users = await userResponse.json();
      const adminUser = users.find((user: any) => user.role === 'Admin');

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      const containerData = {
        serviceName: newContainer.name,
        providerId: adminUser.id,
        status: 'stopped',
        image: newContainer.image,
        ports: parsedPorts,
        volumes: parsedVolumes,
        environment: parsedEnvironment,
        cpuUsage: 0,
        memoryUsage: 0,
        logs: 'Container created via web interface'
      };

      const response = await fetch('/api/containers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(containerData)
      });

      if (!response.ok) {
        throw new Error('Failed to create container');
      }

      const createdContainer = await response.json();

      // Transform for frontend
      const transformedContainer: Container = {
        id: createdContainer.id,
        name: createdContainer.serviceName,
        image: createdContainer.image,
        status: createdContainer.status,
        ports: createdContainer.ports || {},
        volumes: createdContainer.volumes || {},
        environment: createdContainer.environment || {},
        cpuUsage: createdContainer.cpuUsage || 0,
        memoryUsage: createdContainer.memoryUsage || 0,
        logs: createdContainer.logs || 'No logs available',
        createdAt: new Date(createdContainer.createdAt),
        updatedAt: new Date(createdContainer.updatedAt)
      };

      setContainers(prev => [transformedContainer, ...prev]);
      setShowAddDialog(false);
      setNewContainer({ name: '', image: '', ports: '', volumes: '', environment: '' });

      toast({
        title: "Success",
        description: "Container created successfully"
      });
    } catch (error) {
      console.error('Error creating container:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create container",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'default',
      stopped: 'secondary',
      error: 'destructive'
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const formatPorts = (ports?: Record<string, string>) => {
    if (!ports || Object.keys(ports).length === 0) return 'None';
    return Object.entries(ports).map(([host, container]) => `${host}:${container}`).join(', ');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading containers...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Container Management</CardTitle>
              <CardDescription>
                Manage Docker containers for IDS Connector components
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Container
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Container</DialogTitle>
                  <DialogDescription>
                    Create a new Docker container configuration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Container Name</Label>
                    <Input
                      id="name"
                      value={newContainer.name}
                      onChange={(e) => setNewContainer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="my-container"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Docker Image</Label>
                    <Input
                      id="image"
                      value={newContainer.image}
                      onChange={(e) => setNewContainer(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="nginx:latest"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ports">Ports (JSON format)</Label>
                    <Input
                      id="ports"
                      value={newContainer.ports}
                      onChange={(e) => setNewContainer(prev => ({ ...prev, ports: e.target.value }))}
                      placeholder='"8080":"80", "8443":"443"'
                    />
                  </div>
                  <div>
                    <Label htmlFor="volumes">Volumes (JSON format)</Label>
                    <Input
                      id="volumes"
                      value={newContainer.volumes}
                      onChange={(e) => setNewContainer(prev => ({ ...prev, volumes: e.target.value }))}
                      placeholder='"/host/path":"/container/path"'
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment Variables (JSON format)</Label>
                    <Input
                      id="environment"
                      value={newContainer.environment}
                      onChange={(e) => setNewContainer(prev => ({ ...prev, environment: e.target.value }))}
                      placeholder='"NODE_ENV":"production", "PORT":"8080"'
                    />
                  </div>
                  <Button onClick={handleAddContainer} className="w-full">
                    Create Container
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ports</TableHead>
                <TableHead>CPU %</TableHead>
                <TableHead>Memory (MB)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers.map((container) => (
                <TableRow key={container.id}>
                  <TableCell className="font-medium">{container.name}</TableCell>
                  <TableCell>{container.image}</TableCell>
                  <TableCell>{getStatusBadge(container.status)}</TableCell>
                  <TableCell className="text-sm">{formatPorts(container.ports)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Cpu className="mr-1 h-3 w-3" />
                      {container.cpuUsage?.toFixed(1) || '0'}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <HardDrive className="mr-1 h-3 w-3" />
                      {container.memoryUsage?.toFixed(1) || '0'} MB
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {container.status !== 'running' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContainerAction(container.id, 'start')}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {container.status === 'running' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContainerAction(container.id, 'stop')}
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContainerAction(container.id, 'restart')}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedContainer(container);
                          setShowLogsDialog(true);
                        }}
                      >
                        <Activity className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleContainerAction(container.id, 'delete')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Container Logs - {selectedContainer?.name}</DialogTitle>
            <DialogDescription>
              Recent logs from the container
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Textarea
              readOnly
              value={selectedContainer?.logs || 'No logs available'}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}