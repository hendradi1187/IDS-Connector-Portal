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
import { Plus, TestTube, Eye, Trash2, Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { DataSource } from '@/lib/types';

export default function DataSourceManagement() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const { toast } = useToast();

  const [newDataSource, setNewDataSource] = useState({
    name: '',
    type: 'postgresql' as const,
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    schema: '',
    table: '',
    query: '',
    connectionString: ''
  });

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockDataSources: DataSource[] = [
        {
          id: '1',
          name: 'Production Database',
          type: 'postgresql',
          host: 'prod-db.company.com',
          port: 5432,
          database: 'production_data',
          username: 'app_user',
          password: '***',
          schema: 'public',
          table: 'sensor_data',
          status: 'active',
          lastSync: new Date(),
          metadata: { tableCount: 25, recordCount: 1250000 },
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Legacy Oracle System',
          type: 'oracle',
          host: 'legacy-oracle.internal',
          port: 1521,
          database: 'ORCL',
          username: 'legacy_user',
          password: '***',
          schema: 'LEGACY_SCHEMA',
          status: 'active',
          lastSync: new Date(Date.now() - 3600000), // 1 hour ago
          metadata: { tableCount: 150, recordCount: 5000000 },
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'External API - Weather Data',
          type: 'api',
          host: 'api.weather.com',
          connectionString: 'https://api.weather.com/v1/data',
          status: 'inactive',
          metadata: { apiVersion: 'v1', endpoints: 5 },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date()
        },
        {
          id: '4',
          name: 'File Storage - CSV Files',
          type: 'file',
          host: 'file-server.company.com',
          connectionString: '/data/exports/csv/',
          status: 'error',
          metadata: { fileCount: 245, totalSize: '1.2GB' },
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date()
        }
      ];
      setDataSources(mockDataSources);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data sources",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (dataSourceId: string) => {
    try {
      setDataSources(prev => prev.map(ds =>
        ds.id === dataSourceId ? { ...ds, status: 'testing' } : ds
      ));

      // Mock connection test - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = Math.random() > 0.3; // 70% success rate for demo
      const newStatus = success ? 'active' : 'error';

      setDataSources(prev => prev.map(ds =>
        ds.id === dataSourceId
          ? { ...ds, status: newStatus, lastSync: success ? new Date() : ds.lastSync }
          : ds
      ));

      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success
          ? "Data source connection is working properly"
          : "Failed to connect to data source",
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      setDataSources(prev => prev.map(ds =>
        ds.id === dataSourceId ? { ...ds, status: 'error' } : ds
      ));
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive"
      });
    }
  };

  const handleAddDataSource = async () => {
    try {
      const dataSource: DataSource = {
        id: Math.random().toString(36).substr(2, 9),
        name: newDataSource.name,
        type: newDataSource.type,
        host: newDataSource.host,
        port: newDataSource.port ? parseInt(newDataSource.port) : undefined,
        database: newDataSource.database || undefined,
        username: newDataSource.username || undefined,
        password: newDataSource.password || undefined,
        schema: newDataSource.schema || undefined,
        table: newDataSource.table || undefined,
        query: newDataSource.query || undefined,
        connectionString: newDataSource.connectionString || undefined,
        status: 'inactive',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setDataSources(prev => [dataSource, ...prev]);
      setShowAddDialog(false);
      setNewDataSource({
        name: '',
        type: 'postgresql',
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
        schema: '',
        table: '',
        query: '',
        connectionString: ''
      });

      toast({
        title: "Success",
        description: "Data source created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create data source",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDataSource = async (dataSourceId: string) => {
    try {
      setDataSources(prev => prev.filter(ds => ds.id !== dataSourceId));
      toast({
        title: "Success",
        description: "Data source deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete data source",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
      testing: 'outline'
    } as const;

    const icons = {
      active: <CheckCircle className="mr-1 h-3 w-3" />,
      inactive: <XCircle className="mr-1 h-3 w-3" />,
      error: <XCircle className="mr-1 h-3 w-3" />,
      testing: <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    return <Database className="mr-2 h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading data sources...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Source Management</CardTitle>
              <CardDescription>
                Configure and manage connections to external data sources
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Data Source
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Data Source</DialogTitle>
                  <DialogDescription>
                    Configure a new external data source connection
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Data Source Name</Label>
                    <Input
                      id="name"
                      value={newDataSource.name}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Production Database"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newDataSource.type} onValueChange={(value: any) => setNewDataSource(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="oracle">Oracle</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="api">REST API</SelectItem>
                        <SelectItem value="file">File System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      value={newDataSource.host}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost"
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={newDataSource.port}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, port: e.target.value }))}
                      placeholder="5432"
                    />
                  </div>
                  <div>
                    <Label htmlFor="database">Database</Label>
                    <Input
                      id="database"
                      value={newDataSource.database}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, database: e.target.value }))}
                      placeholder="database_name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schema">Schema</Label>
                    <Input
                      id="schema"
                      value={newDataSource.schema}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, schema: e.target.value }))}
                      placeholder="public"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newDataSource.username}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newDataSource.password}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="password"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="connectionString">Connection String (Optional)</Label>
                    <Input
                      id="connectionString"
                      value={newDataSource.connectionString}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, connectionString: e.target.value }))}
                      placeholder="postgresql://user:pass@host:port/db"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="query">Default Query (Optional)</Label>
                    <Textarea
                      id="query"
                      value={newDataSource.query}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, query: e.target.value }))}
                      placeholder="SELECT * FROM table_name LIMIT 100"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddDataSource} className="col-span-2">
                    Create Data Source
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
                <TableHead>Host</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSources.map((dataSource) => (
                <TableRow key={dataSource.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {getTypeIcon(dataSource.type)}
                      {dataSource.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{dataSource.type}</Badge>
                  </TableCell>
                  <TableCell>{dataSource.host}</TableCell>
                  <TableCell>{getStatusBadge(dataSource.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {dataSource.lastSync
                      ? new Date(dataSource.lastSync).toLocaleString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(dataSource.id)}
                        disabled={dataSource.status === 'testing'}
                      >
                        <TestTube className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDataSource(dataSource);
                          setShowPreviewDialog(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDataSource(dataSource.id)}
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

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Data Source Preview - {selectedDataSource?.name}</DialogTitle>
            <DialogDescription>
              Configuration details and sample data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <p className="text-sm text-muted-foreground">{selectedDataSource?.type}</p>
              </div>
              <div>
                <Label>Host</Label>
                <p className="text-sm text-muted-foreground">{selectedDataSource?.host}</p>
              </div>
              <div>
                <Label>Database</Label>
                <p className="text-sm text-muted-foreground">{selectedDataSource?.database || 'N/A'}</p>
              </div>
              <div>
                <Label>Schema</Label>
                <p className="text-sm text-muted-foreground">{selectedDataSource?.schema || 'N/A'}</p>
              </div>
            </div>
            <div>
              <Label>Metadata</Label>
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify(selectedDataSource?.metadata, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}