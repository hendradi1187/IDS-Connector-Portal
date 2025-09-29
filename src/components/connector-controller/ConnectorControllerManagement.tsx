'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Settings,
  Activity,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Cpu,
  HardDrive,
  Network,
  Gauge
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { ConnectorController, ConnectorMetric } from '@/lib/types';

export default function ConnectorControllerManagement() {
  const [controllers, setControllers] = useState<ConnectorController[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedController, setSelectedController] = useState<ConnectorController | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const { toast } = useToast();

  const [newController, setNewController] = useState({
    name: '',
    description: '',
    controllerType: 'IDS_CONNECTOR' as const,
    ipAddress: '',
    port: '',
    version: '',
    capabilities: '',
    configuration: ''
  });

  useEffect(() => {
    loadControllers();
  }, []);

  const loadControllers = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockControllers: ConnectorController[] = [
        {
          id: '1',
          name: 'Main IDS Connector',
          description: 'Primary IDS connector for data exchange',
          controllerType: 'IDS_CONNECTOR',
          status: 'active',
          ipAddress: '192.168.1.100',
          port: 8080,
          version: '2.1.0',
          capabilities: {
            protocols: ['HTTPS', 'IDS'],
            dataFormats: ['JSON', 'XML', 'CSV'],
            maxConnections: 100
          },
          configuration: {
            timeouts: { connection: 30, read: 60 },
            security: { tls: true, certificates: ['cert1.pem'] }
          },
          lastCommunication: new Date(),
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date(),
          metrics: [
            { id: '1', metricType: 'CPU_USAGE', value: 45.2, unit: '%', timestamp: new Date() },
            { id: '2', metricType: 'MEMORY_USAGE', value: 68.5, unit: '%', timestamp: new Date() },
            { id: '3', metricType: 'DISK_USAGE', value: 32.1, unit: '%', timestamp: new Date() },
            { id: '4', metricType: 'RESPONSE_TIME', value: 120, unit: 'ms', timestamp: new Date() }
          ]
        },
        {
          id: '2',
          name: 'Data Processor',
          description: 'Handles data transformation and processing',
          controllerType: 'DATA_PROCESSOR',
          status: 'active',
          ipAddress: '192.168.1.101',
          port: 8081,
          version: '1.5.2',
          capabilities: {
            processors: ['ETL', 'Validation', 'Encryption'],
            throughput: '1000 records/sec'
          },
          lastCommunication: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date(),
          metrics: [
            { id: '5', metricType: 'CPU_USAGE', value: 75.8, unit: '%', timestamp: new Date() },
            { id: '6', metricType: 'MEMORY_USAGE', value: 82.3, unit: '%', timestamp: new Date() },
            { id: '7', metricType: 'REQUEST_COUNT', value: 1250, unit: 'req/min', timestamp: new Date() }
          ]
        },
        {
          id: '3',
          name: 'Security Gateway',
          description: 'Manages authentication and authorization',
          controllerType: 'SECURITY_GATEWAY',
          status: 'maintenance',
          ipAddress: '192.168.1.102',
          port: 8443,
          version: '3.0.1',
          capabilities: {
            authentication: ['OAuth2', 'SAML', 'Certificate'],
            encryption: ['AES-256', 'RSA-2048']
          },
          lastCommunication: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date(),
          metrics: []
        }
      ];
      setControllers(mockControllers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load connector controllers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleControllerAction = async (controllerId: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === 'delete') {
        setControllers(prev => prev.filter(c => c.id !== controllerId));
        toast({
          title: "Success",
          description: "Controller deleted successfully"
        });
      } else {
        let newStatus: 'active' | 'inactive' | 'error' | 'maintenance';
        switch (action) {
          case 'start':
          case 'restart':
            newStatus = 'active';
            break;
          case 'stop':
            newStatus = 'inactive';
            break;
          default:
            newStatus = 'inactive';
        }

        setControllers(prev => prev.map(c =>
          c.id === controllerId
            ? { ...c, status: newStatus, lastCommunication: new Date(), updatedAt: new Date() }
            : c
        ));
        toast({
          title: "Success",
          description: `Controller ${action}ed successfully`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} controller`,
        variant: "destructive"
      });
    }
  };

  const handleAddController = async () => {
    try {
      const controller: ConnectorController = {
        id: Math.random().toString(36).substr(2, 9),
        name: newController.name,
        description: newController.description,
        controllerType: newController.controllerType,
        status: 'inactive',
        ipAddress: newController.ipAddress || undefined,
        port: newController.port ? parseInt(newController.port) : undefined,
        version: newController.version || undefined,
        capabilities: newController.capabilities ? JSON.parse(newController.capabilities) : undefined,
        configuration: newController.configuration ? JSON.parse(newController.configuration) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: []
      };

      setControllers(prev => [controller, ...prev]);
      setShowAddDialog(false);
      setNewController({
        name: '',
        description: '',
        controllerType: 'IDS_CONNECTOR',
        ipAddress: '',
        port: '',
        version: '',
        capabilities: '',
        configuration: ''
      });

      toast({
        title: "Success",
        description: "Controller created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create controller",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
      maintenance: 'outline'
    } as const;

    const icons = {
      active: <Power className="mr-1 h-3 w-3" />,
      inactive: <PowerOff className="mr-1 h-3 w-3" />,
      error: <Power className="mr-1 h-3 w-3" />,
      maintenance: <Settings className="mr-1 h-3 w-3" />
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const getControllerTypeColor = (type: string) => {
    const colors = {
      IDS_CONNECTOR: 'bg-blue-100 text-blue-800',
      DATA_PROCESSOR: 'bg-green-100 text-green-800',
      BROKER_INTERFACE: 'bg-purple-100 text-purple-800',
      SECURITY_GATEWAY: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMetricIcon = (metricType: string) => {
    const icons = {
      CPU_USAGE: <Cpu className="h-4 w-4" />,
      MEMORY_USAGE: <HardDrive className="h-4 w-4" />,
      DISK_USAGE: <HardDrive className="h-4 w-4" />,
      NETWORK_IN: <Network className="h-4 w-4" />,
      NETWORK_OUT: <Network className="h-4 w-4" />,
      REQUEST_COUNT: <Activity className="h-4 w-4" />,
      ERROR_RATE: <Activity className="h-4 w-4" />,
      RESPONSE_TIME: <Gauge className="h-4 w-4" />
    };
    return icons[metricType as keyof typeof icons] || <Activity className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading controllers...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connector Controller Management</CardTitle>
              <CardDescription>
                Manage and monitor IDS connector controllers
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Controller
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Controller</DialogTitle>
                  <DialogDescription>
                    Configure a new connector controller
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Controller Name</Label>
                    <Input
                      id="name"
                      value={newController.name}
                      onChange={(e) => setNewController(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Main IDS Connector"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newController.description}
                      onChange={(e) => setNewController(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Primary connector for data exchange"
                    />
                  </div>
                  <div>
                    <Label htmlFor="controllerType">Controller Type</Label>
                    <Select value={newController.controllerType} onValueChange={(value: any) => setNewController(prev => ({ ...prev, controllerType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDS_CONNECTOR">IDS Connector</SelectItem>
                        <SelectItem value="DATA_PROCESSOR">Data Processor</SelectItem>
                        <SelectItem value="BROKER_INTERFACE">Broker Interface</SelectItem>
                        <SelectItem value="SECURITY_GATEWAY">Security Gateway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={newController.version}
                      onChange={(e) => setNewController(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="2.1.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input
                      id="ipAddress"
                      value={newController.ipAddress}
                      onChange={(e) => setNewController(prev => ({ ...prev, ipAddress: e.target.value }))}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={newController.port}
                      onChange={(e) => setNewController(prev => ({ ...prev, port: e.target.value }))}
                      placeholder="8080"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="capabilities">Capabilities (JSON)</Label>
                    <Textarea
                      id="capabilities"
                      value={newController.capabilities}
                      onChange={(e) => setNewController(prev => ({ ...prev, capabilities: e.target.value }))}
                      placeholder='{"protocols": ["HTTPS", "IDS"], "maxConnections": 100}'
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="configuration">Configuration (JSON)</Label>
                    <Textarea
                      id="configuration"
                      value={newController.configuration}
                      onChange={(e) => setNewController(prev => ({ ...prev, configuration: e.target.value }))}
                      placeholder='{"timeouts": {"connection": 30, "read": 60}}'
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddController} className="col-span-2">
                    Create Controller
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
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Communication</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controllers.map((controller) => (
                <TableRow key={controller.id}>
                  <TableCell className="font-medium">{controller.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getControllerTypeColor(controller.controllerType)}`}>
                      {controller.controllerType.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {controller.ipAddress && controller.port
                      ? `${controller.ipAddress}:${controller.port}`
                      : controller.ipAddress || 'N/A'
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(controller.status)}</TableCell>
                  <TableCell>{controller.version || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {controller.lastCommunication
                      ? new Date(controller.lastCommunication).toLocaleString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {controller.status !== 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleControllerAction(controller.id, 'start')}
                        >
                          <Power className="h-3 w-3" />
                        </Button>
                      )}
                      {controller.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleControllerAction(controller.id, 'stop')}
                        >
                          <PowerOff className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleControllerAction(controller.id, 'restart')}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedController(controller);
                          setShowMetricsDialog(true);
                        }}
                      >
                        <Activity className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleControllerAction(controller.id, 'delete')}
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

      {/* Metrics Dialog */}
      <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Controller Metrics - {selectedController?.name}</DialogTitle>
            <DialogDescription>
              Real-time metrics and performance data
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="metrics" className="w-full">
            <TabsList>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedController?.metrics?.map((metric) => (
                  <Card key={metric.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getMetricIcon(metric.metricType)}
                          <span className="font-medium text-sm">
                            {metric.metricType.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {metric.unit}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{metric.value}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(metric.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {metric.metricType.includes('USAGE') && (
                          <Progress value={metric.value} className="w-full" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(selectedController?.configuration, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capabilities">
              <Card>
                <CardHeader>
                  <CardTitle>Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(selectedController?.capabilities, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}