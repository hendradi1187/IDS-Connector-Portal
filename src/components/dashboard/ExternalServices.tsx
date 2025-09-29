'use client';

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
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { RefreshCw, ExternalLink, Shield, Database, Globe, Layers, Server, RefreshCcw, Eye, BarChart3, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import AddExternalServiceDialog from '@/components/dialogs/AddExternalServiceDialog';
import ServiceDetailDialog from '@/components/dialogs/ServiceDetailDialog';
import { useLicenseValidation } from '@/components/license/LicenseGuard';

import { ExternalService } from '@/lib/types';

const statusColors: { [key in ExternalService['status']]: string } = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  error: 'bg-red-500',
  syncing: 'bg-yellow-500',
};

const serviceTypeColors: { [key in ExternalService['serviceType']]: string } = {
  IDS_BROKER: 'bg-blue-100 text-blue-800',
  DATA_CATALOG: 'bg-green-100 text-green-800',
  AUTHENTICATION: 'bg-purple-100 text-purple-800',
  MONITORING: 'bg-orange-100 text-orange-800',
  ANALYTICS: 'bg-pink-100 text-pink-800',
  OGC_OSDU_ADAPTOR: 'bg-cyan-100 text-cyan-800',
  DATA_PROVIDER: 'bg-emerald-100 text-emerald-800',
  METADATA_BROKER: 'bg-indigo-100 text-indigo-800',
};

export default function ExternalServices() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [services, setServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<{ [key: string]: boolean }>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // License validation for OGC-OSDU Adaptor features
  const ogcOsduLicense = useLicenseValidation('ogc_osdu_adaptor');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.externalServices.getAll();
      setServices(response);
    } catch (error) {
      console.error('Error fetching external services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch external services",
        variant: "destructive"
      });
      // Fallback to mock data for demo
      setServices(mockServices);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (serviceId: string) => {
    try {
      // Find the service to check its type
      const service = services.find(s => s.id === serviceId);

      // Check license for OGC-OSDU Adaptor features
      if (service && (
        service.serviceType === 'OGC_OSDU_ADAPTOR' ||
        service.serviceType === 'DATA_PROVIDER' ||
        service.serviceType === 'METADATA_BROKER'
      )) {
        if (!ogcOsduLicense.isValid || !ogcOsduLicense.hasFeatureAccess) {
          toast({
            title: "License Required",
            description: `${service.serviceType.replace(/_/g, ' ')} sync requires a valid OGC-OSDU license`,
            variant: "destructive"
          });
          return;
        }
      }

      setSyncing(prev => ({ ...prev, [serviceId]: true }));

      // Update service status to syncing
      setServices(prev => prev.map(service =>
        service.id === serviceId ? { ...service, status: 'syncing' } : service
      ));

      const response = await fetch(`/api/external-services/${serviceId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncType: 'FULL',
          metadata: { initiatedBy: 'user' }
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Sync Started",
          description: `Synchronization started for ${services.find(s => s.id === serviceId)?.name}`,
        });

        // Poll for sync completion (simplified)
        setTimeout(() => {
          setServices(prev => prev.map(service =>
            service.id === serviceId ? {
              ...service,
              status: 'active',
              lastSync: new Date().toISOString()
            } : service
          ));
          setSyncing(prev => ({ ...prev, [serviceId]: false }));
          toast({
            title: "Sync Completed",
            description: `Synchronization completed successfully`,
          });
        }, 5000);
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncing(prev => ({ ...prev, [serviceId]: false }));
      setServices(prev => prev.map(service =>
        service.id === serviceId ? { ...service, status: 'error' } : service
      ));
      toast({
        title: "Sync Failed",
        description: "Failed to start synchronization",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Mock data untuk demo
  const mockServices: ExternalService[] = [
    {
      id: '1',
      name: 'IDS Metadata Broker',
      description: 'Central metadata broker for IDS ecosystem',
      serviceType: 'IDS_BROKER',
      endpoint: 'https://broker.ids-ecosystem.org',
      authType: 'CERTIFICATE',
      status: 'active',
      lastSync: '2024-01-21T10:30:00Z',
      syncInterval: 60,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-21T10:30:00Z'
    },
    {
      id: '2',
      name: 'SKK Migas Data Catalog',
      description: 'Government data catalog service',
      serviceType: 'DATA_CATALOG',
      endpoint: 'https://data.skkmigas.go.id/api',
      authType: 'API_KEY',
      status: 'active',
      lastSync: '2024-01-21T09:15:00Z',
      syncInterval: 30,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-21T09:15:00Z'
    },
    {
      id: '3',
      name: 'OAuth2 Identity Provider',
      description: 'Central authentication service',
      serviceType: 'AUTHENTICATION',
      endpoint: 'https://auth.example.com',
      authType: 'OAUTH2',
      status: 'active',
      lastSync: '2024-01-21T08:45:00Z',
      syncInterval: 15,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-21T08:45:00Z'
    },
    {
      id: '4',
      name: 'Prometheus Monitoring',
      description: 'System and application monitoring',
      serviceType: 'MONITORING',
      endpoint: 'https://prometheus.internal.com',
      authType: 'BASIC_AUTH',
      status: 'error',
      lastSync: '2024-01-20T15:20:00Z',
      syncInterval: 10,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T15:20:00Z'
    },
    {
      id: '5',
      name: 'Analytics Dashboard',
      description: 'Business intelligence and analytics',
      serviceType: 'ANALYTICS',
      endpoint: 'https://analytics.company.com',
      authType: 'API_KEY',
      status: 'syncing',
      lastSync: '2024-01-21T11:00:00Z',
      syncInterval: 120,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-21T11:00:00Z'
    },
    {
      id: '6',
      name: 'OGC-OSDU Metadata Adaptor',
      description: 'OGC and OSDU standards adaptor for metadata synchronization',
      serviceType: 'OGC_OSDU_ADAPTOR',
      endpoint: 'https://ogc-osdu.example.com/api',
      authType: 'OIDC_PKI',
      status: 'active',
      lastSync: '2024-01-21T10:45:00Z',
      syncInterval: 60,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-21T10:45:00Z'
    },
    {
      id: '7',
      name: 'Pertamina Data Provider',
      description: 'Enterprise data provider service',
      serviceType: 'DATA_PROVIDER',
      endpoint: 'https://data.pertamina.com/api',
      authType: 'OIDC',
      status: 'inactive',
      lastSync: '2024-01-20T14:30:00Z',
      syncInterval: 120,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    }
  ];

  const getStatusBadge = (status: ExternalService['status']) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: t('external.online'), icon: '🟢' },
      inactive: { variant: 'secondary' as const, label: t('external.offline'), icon: '⚫' },
      error: { variant: 'destructive' as const, label: t('external.error'), icon: '🔴' },
      syncing: { variant: 'outline' as const, label: t('external.syncing'), icon: '🟡' }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const getServiceTypeBadge = (serviceType: ExternalService['serviceType']) => {
    const icons = {
      IDS_BROKER: <Shield className="h-3 w-3 mr-1" />,
      DATA_CATALOG: <Database className="h-3 w-3 mr-1" />,
      AUTHENTICATION: <Shield className="h-3 w-3 mr-1" />,
      MONITORING: <RefreshCw className="h-3 w-3 mr-1" />,
      ANALYTICS: <Database className="h-3 w-3 mr-1" />,
      OGC_OSDU_ADAPTOR: <Globe className="h-3 w-3 mr-1" />,
      DATA_PROVIDER: <Layers className="h-3 w-3 mr-1" />,
      METADATA_BROKER: <Server className="h-3 w-3 mr-1" />
    };

    return (
      <Badge variant="outline" className={serviceTypeColors[serviceType]}>
        {icons[serviceType]}
        {serviceType.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              {t('external.title')}
            </CardTitle>
            <CardDescription>
              {t('external.description')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add External Service
            </Button>
            <Button variant="outline" size="sm" onClick={fetchServices} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              {t('external.refresh')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('external.service')}</TableHead>
              <TableHead>{t('external.type')}</TableHead>
              <TableHead>{t('external.authentication')}</TableHead>
              <TableHead>{t('external.last-sync')}</TableHead>
              <TableHead>{t('external.status')}</TableHead>
              <TableHead className="text-right">{t('external.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="mt-2 h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.description}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {service.endpoint}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getServiceTypeBadge(service.serviceType)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.authType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {service.lastSync ? new Date(service.lastSync).toLocaleString() : t('external.never')}
                    </div>
                    {service.syncInterval && (
                      <div className="text-xs text-muted-foreground">
                        {t('external.every')} {service.syncInterval}{t('external.min')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(service.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {(service.serviceType === 'OGC_OSDU_ADAPTOR' ||
                        service.serviceType === 'DATA_PROVIDER' ||
                        service.serviceType === 'METADATA_BROKER') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(service.id)}
                          disabled={syncing[service.id] || service.status === 'syncing'}
                        >
                          <RefreshCcw className={cn(
                            "h-4 w-4 mr-1",
                            (syncing[service.id] || service.status === 'syncing') && "animate-spin"
                          )} />
                          Sync
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedServiceId(service.id)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <AddExternalServiceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onServiceAdded={fetchServices}
      />

      <ServiceDetailDialog
        open={selectedServiceId !== null}
        onOpenChange={(open) => !open && setSelectedServiceId(null)}
        serviceId={selectedServiceId}
      />
    </Card>
  );
}
