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
import { apiClient } from '@/lib/api/client';
import { Plus, Edit, Trash2, RefreshCw, Server, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { DataspaceConnector } from '@/lib/types';

export default function DataspaceConnectorManagement() {
  const { toast } = useToast();
  const [connectors, setConnectors] = useState<DataspaceConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<DataspaceConnector | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    connectorUrl: '',
    version: '',
    securityProfile: '',
    supportedFormats: '',
    capabilities: ''
  });

  useEffect(() => {
    fetchConnectors();
  }, []);

  const fetchConnectors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.dataspaceConnectors.getAll();
      setConnectors(response || []);
    } catch (error) {
      console.error('Error fetching dataspace connectors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dataspace connectors",
        variant: "destructive"
      });
      setConnectors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data = {
        name: formData.name,
        connectorUrl: formData.connectorUrl,
        version: formData.version,
        securityProfile: formData.securityProfile ? JSON.parse(formData.securityProfile) : {},
        supportedFormats: formData.supportedFormats.split(',').map(f => f.trim()),
        capabilities: formData.capabilities ? JSON.parse(formData.capabilities) : {}
      };

      await apiClient.dataspaceConnectors.register(data);
      toast({
        title: "Success",
        description: "Dataspace connector registered successfully"
      });
      setIsCreateOpen(false);
      resetForm();
      fetchConnectors();
    } catch (error) {
      console.error('Error creating dataspace connector:', error);
      toast({
        title: "Error",
        description: "Failed to register dataspace connector",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedConnector) return;

    try {
      const data = {
        name: formData.name,
        connectorUrl: formData.connectorUrl,
        version: formData.version,
        securityProfile: formData.securityProfile ? JSON.parse(formData.securityProfile) : {},
        supportedFormats: formData.supportedFormats.split(',').map(f => f.trim()),
        capabilities: formData.capabilities ? JSON.parse(formData.capabilities) : {}
      };

      await apiClient.dataspaceConnectors.update(selectedConnector.id, data);
      toast({
        title: "Success",
        description: "Dataspace connector updated successfully"
      });
      setIsEditOpen(false);
      resetForm();
      fetchConnectors();
    } catch (error) {
      console.error('Error updating dataspace connector:', error);
      toast({
        title: "Error",
        description: "Failed to update dataspace connector",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dataspace connector?')) return;

    try {
      await apiClient.dataspaceConnectors.delete(id);
      toast({
        title: "Success",
        description: "Dataspace connector deleted successfully"
      });
      fetchConnectors();
    } catch (error) {
      console.error('Error deleting dataspace connector:', error);
      toast({
        title: "Error",
        description: "Failed to delete dataspace connector",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      connectorUrl: '',
      version: '',
      securityProfile: '',
      supportedFormats: '',
      capabilities: ''
    });
    setSelectedConnector(null);
  };

  const openEditDialog = (connector: DataspaceConnector) => {
    setSelectedConnector(connector);
    setFormData({
      name: connector.name,
      connectorUrl: connector.connectorUrl,
      version: connector.version,
      securityProfile: JSON.stringify(connector.securityProfile, null, 2),
      supportedFormats: connector.supportedFormats.join(', '),
      capabilities: JSON.stringify(connector.capabilities, null, 2)
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      maintenance: { variant: 'outline' as const, label: 'Maintenance' },
      error: { variant: 'destructive' as const, label: 'Error' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const mockConnectors: DataspaceConnector[] = [
    {
      id: '1',
      name: 'Primary IDS Connector',
      connectorUrl: 'https://connector.example.com',
      version: '4.3.0',
      status: 'active',
      securityProfile: { encryption: 'TLS1.3', authentication: 'OAuth2' },
      supportedFormats: ['JSON-LD', 'RDF/XML', 'Turtle'],
      capabilities: { protocols: ['HTTPS', 'IDSCP2'], maxFileSize: '1GB' },
      registeredAt: '2024-01-15T10:30:00Z',
      lastHealthCheck: '2024-01-20T15:45:00Z',
      metadata: {}
    },
    {
      id: '2',
      name: 'Secondary Data Connector',
      connectorUrl: 'https://data-connector.example.com',
      version: '4.2.1',
      status: 'maintenance',
      securityProfile: { encryption: 'TLS1.2', authentication: 'Certificate' },
      supportedFormats: ['JSON', 'XML'],
      capabilities: { protocols: ['HTTPS'], maxFileSize: '500MB' },
      registeredAt: '2024-01-10T08:15:00Z',
      lastHealthCheck: '2024-01-19T12:30:00Z',
      metadata: {}
    }
  ];

  const displayConnectors = connectors.length > 0 ? connectors : mockConnectors;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Dataspace Connectors
              </CardTitle>
              <CardDescription>
                Manage and monitor registered dataspace connectors
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchConnectors}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Register Connector
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Register New Dataspace Connector</DialogTitle>
                    <DialogDescription>
                      Register a new connector to the dataspace network
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Connector name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="version">Version</Label>
                        <Input
                          id="version"
                          value={formData.version}
                          onChange={(e) => setFormData({...formData, version: e.target.value})}
                          placeholder="e.g., 4.3.0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connectorUrl">Connector URL</Label>
                      <Input
                        id="connectorUrl"
                        value={formData.connectorUrl}
                        onChange={(e) => setFormData({...formData, connectorUrl: e.target.value})}
                        placeholder="https://connector.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportedFormats">Supported Formats</Label>
                      <Input
                        id="supportedFormats"
                        value={formData.supportedFormats}
                        onChange={(e) => setFormData({...formData, supportedFormats: e.target.value})}
                        placeholder="JSON-LD, RDF/XML, Turtle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="securityProfile">Security Profile (JSON)</Label>
                      <Textarea
                        id="securityProfile"
                        value={formData.securityProfile}
                        onChange={(e) => setFormData({...formData, securityProfile: e.target.value})}
                        placeholder='{"encryption": "TLS1.3", "authentication": "OAuth2"}'
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capabilities">Capabilities (JSON)</Label>
                      <Textarea
                        id="capabilities"
                        value={formData.capabilities}
                        onChange={(e) => setFormData({...formData, capabilities: e.target.value})}
                        placeholder='{"protocols": ["HTTPS", "IDSCP2"], "maxFileSize": "1GB"}'
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate}>Register Connector</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading connectors...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Formats</TableHead>
                  <TableHead>Last Check</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayConnectors.map((connector) => (
                  <TableRow key={connector.id}>
                    <TableCell className="font-medium">{connector.name}</TableCell>
                    <TableCell className="font-mono text-sm">{connector.connectorUrl}</TableCell>
                    <TableCell>{connector.version}</TableCell>
                    <TableCell>{getStatusBadge(connector.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {connector.supportedFormats.slice(0, 2).map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                        {connector.supportedFormats.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{connector.supportedFormats.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {connector.lastHealthCheck
                        ? new Date(connector.lastHealthCheck).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(connector)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(connector.id)}
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

      {selectedConnector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Connector Details: {selectedConnector.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Connector URL</Label>
                    <p className="text-sm text-muted-foreground font-mono">{selectedConnector.connectorUrl}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Version</Label>
                    <p className="text-sm text-muted-foreground">{selectedConnector.version}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedConnector.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Registered</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedConnector.registeredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Supported Formats</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedConnector.supportedFormats.map((format) => (
                      <Badge key={format} variant="outline">{format}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Security Profile</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-auto">
                    {JSON.stringify(selectedConnector.securityProfile, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="capabilities" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Capabilities</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-auto">
                    {JSON.stringify(selectedConnector.capabilities, null, 2)}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Dataspace Connector</DialogTitle>
            <DialogDescription>
              Update connector information and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-version">Version</Label>
                <Input
                  id="edit-version"
                  value={formData.version}
                  onChange={(e) => setFormData({...formData, version: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-connectorUrl">Connector URL</Label>
              <Input
                id="edit-connectorUrl"
                value={formData.connectorUrl}
                onChange={(e) => setFormData({...formData, connectorUrl: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supportedFormats">Supported Formats</Label>
              <Input
                id="edit-supportedFormats"
                value={formData.supportedFormats}
                onChange={(e) => setFormData({...formData, supportedFormats: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-securityProfile">Security Profile (JSON)</Label>
              <Textarea
                id="edit-securityProfile"
                value={formData.securityProfile}
                onChange={(e) => setFormData({...formData, securityProfile: e.target.value})}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capabilities">Capabilities (JSON)</Label>
              <Textarea
                id="edit-capabilities"
                value={formData.capabilities}
                onChange={(e) => setFormData({...formData, capabilities: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Connector</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}