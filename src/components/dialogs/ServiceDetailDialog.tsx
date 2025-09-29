'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Globe,
  Layers,
  Server,
  Shield,
  Database,
  Clock,
  Activity,
  FileText,
  RefreshCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string | null;
}

interface ServiceStats {
  service: {
    id: string;
    name: string;
    status: string;
    lastSync: string | null;
    isCurrentlySyncing: boolean;
  };
  audit: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    successRate: number;
  };
  sync: {
    totalSyncs: number;
    completedSyncs: number;
    failedSyncs: number;
    totalRecordsProcessed: number;
    successRate: number;
    lastSync: {
      id: string;
      status: string;
      startedAt: string;
      completedAt: string;
      recordsProcessed: number;
      syncType: string;
    } | null;
  };
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

interface AuditLog {
  id: string;
  action: string;
  endpoint: string;
  requestMethod: string;
  responseStatus: number;
  responseTime: number;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

export default function ServiceDetailDialog({
  open,
  onOpenChange,
  serviceId
}: ServiceDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open && serviceId) {
      fetchServiceDetails();
    }
  }, [open, serviceId]);

  const fetchServiceDetails = async () => {
    if (!serviceId) return;

    try {
      setLoading(true);

      // Fetch service statistics
      const statsResponse = await fetch(`/api/external-services/${serviceId}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch audit logs
      const auditResponse = await fetch(`/api/external-services/${serviceId}/audit?limit=20`);
      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setAuditLogs(auditData);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCcw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResponseStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge variant="outline" className="bg-green-50 text-green-700">SUCCESS</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">CLIENT ERROR</Badge>;
    } else if (status >= 500) {
      return <Badge variant="outline" className="bg-red-50 text-red-700">SERVER ERROR</Badge>;
    }
    return <Badge variant="outline">UNKNOWN</Badge>;
  };

  if (!serviceId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {stats?.service?.name || 'External Service Details'}
          </DialogTitle>
          <DialogDescription>
            View detailed information, statistics, and audit logs for this service
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sync">Synchronization</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading service details...</div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Service Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(stats.service.status)}
                      <Badge variant={stats.service.status === 'active' ? 'default' : 'secondary'}>
                        {stats.service.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last sync: {stats.service.lastSync
                        ? new Date(stats.service.lastSync).toLocaleString()
                        : 'Never'
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Request Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Requests:</span>
                        <span className="font-medium">{stats.audit.totalRequests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Success Rate:</span>
                        <span className="font-medium">{stats.audit.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Response Time:</span>
                        <span className="font-medium">{stats.audit.averageResponseTime.toFixed(0)}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.audit.successfulRequests}</div>
                        <div className="text-sm text-muted-foreground">Successful</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.audit.failedRequests}</div>
                        <div className="text-sm text-muted-foreground">Failed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.sync.completedSyncs}</div>
                        <div className="text-sm text-muted-foreground">Syncs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.sync.totalRecordsProcessed}</div>
                        <div className="text-sm text-muted-foreground">Records</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No statistics available for this service
              </div>
            )}
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading synchronization details...</div>
            ) : stats ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4" />
                      Last Synchronization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.sync.lastSync ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge variant={stats.sync.lastSync.status === 'completed' ? 'default' : 'destructive'}>
                            {stats.sync.lastSync.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Type:</span>
                          <span className="font-medium">{stats.sync.lastSync.syncType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Records Processed:</span>
                          <span className="font-medium">{stats.sync.lastSync.recordsProcessed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Duration:</span>
                          <span className="font-medium">
                            {((new Date(stats.sync.lastSync.completedAt).getTime() -
                               new Date(stats.sync.lastSync.startedAt).getTime()) / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No synchronization history available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Sync Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold">{stats.sync.totalSyncs}</div>
                        <div className="text-sm text-muted-foreground">Total Syncs</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-600">{stats.sync.completedSyncs}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-red-600">{stats.sync.failedSyncs}</div>
                        <div className="text-sm text-muted-foreground">Failed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No synchronization data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recent Audit Logs
                </CardTitle>
                <CardDescription>
                  Last 20 API requests and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogs.length > 0 ? (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.requestMethod}
                            </Badge>
                            <span className="text-sm font-medium">{log.action}</span>
                          </div>
                          {getResponseStatusBadge(log.responseStatus)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>{log.endpoint}</div>
                          <div className="flex items-center gap-4 mt-1">
                            <span>Status: {log.responseStatus}</span>
                            <span>Time: {log.responseTime}ms</span>
                            <span>When: {new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No audit logs available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Service Configuration</CardTitle>
                <CardDescription>
                  Manage service settings and configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Edit Configuration
                  </Button>
                  <Button variant="outline" className="w-full">
                    Test Connection
                  </Button>
                  <Separator />
                  <Button variant="destructive" className="w-full">
                    Delete Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}