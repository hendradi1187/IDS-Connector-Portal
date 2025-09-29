'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Globe, Layers, Server, Shield, Database } from 'lucide-react';

interface AddExternalServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceAdded?: () => void;
}

type ServiceType = 'IDS_BROKER' | 'DATA_CATALOG' | 'AUTHENTICATION' | 'MONITORING' | 'ANALYTICS' | 'OGC_OSDU_ADAPTOR' | 'DATA_PROVIDER' | 'METADATA_BROKER';
type AuthType = 'API_KEY' | 'OAUTH2' | 'BASIC_AUTH' | 'CERTIFICATE' | 'NONE' | 'OIDC' | 'PKI' | 'OIDC_PKI';

const serviceTypeConfig = {
  IDS_BROKER: {
    label: 'IDS Broker',
    icon: <Shield className="h-4 w-4" />,
    description: 'International Data Space broker for metadata exchange'
  },
  DATA_CATALOG: {
    label: 'Data Catalog',
    icon: <Database className="h-4 w-4" />,
    description: 'Catalog service for data discovery and metadata'
  },
  AUTHENTICATION: {
    label: 'Authentication',
    icon: <Shield className="h-4 w-4" />,
    description: 'Identity and access management service'
  },
  MONITORING: {
    label: 'Monitoring',
    icon: <Database className="h-4 w-4" />,
    description: 'System monitoring and observability service'
  },
  ANALYTICS: {
    label: 'Analytics',
    icon: <Database className="h-4 w-4" />,
    description: 'Data analytics and business intelligence service'
  },
  OGC_OSDU_ADAPTOR: {
    label: 'OGC-OSDU Adaptor',
    icon: <Globe className="h-4 w-4" />,
    description: 'Open Geospatial Consortium and Open Subsurface Data Universe adaptor'
  },
  DATA_PROVIDER: {
    label: 'Data Provider',
    icon: <Layers className="h-4 w-4" />,
    description: 'External data provider service'
  },
  METADATA_BROKER: {
    label: 'Metadata Broker',
    icon: <Server className="h-4 w-4" />,
    description: 'Metadata brokering and management service'
  }
};

const authTypeConfig = {
  API_KEY: { label: 'API Key', description: 'Simple API key authentication' },
  OAUTH2: { label: 'OAuth 2.0', description: 'OAuth 2.0 authorization flow' },
  BASIC_AUTH: { label: 'Basic Auth', description: 'Username and password authentication' },
  CERTIFICATE: { label: 'Certificate', description: 'X.509 certificate authentication' },
  NONE: { label: 'None', description: 'No authentication required' },
  OIDC: { label: 'OpenID Connect', description: 'OpenID Connect authentication' },
  PKI: { label: 'PKI', description: 'Public Key Infrastructure authentication' },
  OIDC_PKI: { label: 'OIDC + PKI', description: 'Combined OpenID Connect and PKI authentication' }
};

export default function AddExternalServiceDialog({
  open,
  onOpenChange,
  onServiceAdded
}: AddExternalServiceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serviceType: '' as ServiceType,
    endpoint: '',
    authType: '' as AuthType,
    syncInterval: 60,
    metadata: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.serviceType || !formData.endpoint || !formData.authType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Create the service via API
      const response = await fetch('/api/external-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'inactive',
          metadata: {
            ...formData.metadata,
            createdVia: 'ui',
            createdAt: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        toast({
          title: "Service Added",
          description: `${formData.name} has been added successfully`,
        });

        // Reset form
        setFormData({
          name: '',
          description: '',
          serviceType: '' as ServiceType,
          endpoint: '',
          authType: '' as AuthType,
          syncInterval: 60,
          metadata: {}
        });

        onOpenChange(false);
        onServiceAdded?.();
      } else {
        throw new Error('Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to add external service",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add External Service</DialogTitle>
          <DialogDescription>
            Add a new external service to integrate with your IDS connector.
            For OGC-OSDU adaptors, ensure proper OIDC and PKI configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., OGC-OSDU Metadata Adaptor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL *</Label>
              <Input
                id="endpoint"
                type="url"
                value={formData.endpoint}
                onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://api.example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the service and its purpose..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value as ServiceType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(serviceTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <div>
                          <div className="font-medium">{config.label}</div>
                          <div className="text-sm text-muted-foreground">{config.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authType">Authentication Type *</Label>
              <Select
                value={formData.authType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, authType: value as AuthType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select auth type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(authTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{config.label}</div>
                        <div className="text-sm text-muted-foreground">{config.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(formData.serviceType === 'OGC_OSDU_ADAPTOR' ||
            formData.serviceType === 'DATA_PROVIDER' ||
            formData.serviceType === 'METADATA_BROKER') && (
            <div className="space-y-2">
              <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
              <Input
                id="syncInterval"
                type="number"
                min="1"
                max="1440"
                value={formData.syncInterval}
                onChange={(e) => setFormData(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 60 }))}
              />
              <div className="text-sm text-muted-foreground">
                How often to synchronize metadata (1-1440 minutes)
              </div>
            </div>
          )}

          {formData.serviceType === 'OGC_OSDU_ADAPTOR' && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                OGC-OSDU Adaptor Configuration
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• This adaptor will connect to OGC and OSDU compliant services</p>
                <p>• Supports metadata synchronization with Metadata Broker</p>
                <p>• Enables access to Clearing House and Vocabulary Provider</p>
                <p>• Recommended authentication: OIDC + PKI for enhanced security</p>
              </div>
              {(formData.authType === 'OIDC' || formData.authType === 'PKI' || formData.authType === 'OIDC_PKI') && (
                <Badge variant="outline" className="mt-2 bg-green-100 text-green-800">
                  ✓ Compatible authentication selected
                </Badge>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}