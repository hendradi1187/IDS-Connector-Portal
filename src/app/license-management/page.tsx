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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import {
  Shield,
  Key,
  Calendar,
  Users,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';

interface LicenseStatus {
  hasActiveLicense: boolean;
  license?: {
    id: string;
    licenseName: string;
    licenseType: string;
    licenseLevel: string;
    status: string;
    isActive: boolean;
    organizationName: string;
    contactEmail: string;
    activationDate: string;
    expirationDate: string;
    daysUntilExpiration: number;
    isExpiringSoon: boolean;
    isExpired: boolean;
    lastUsed: string;
    usageCount: number;
    enabledFeatures: string[];
    restrictedFeatures: string[];
    maxUsers?: number;
    maxConnectors?: number;
    maxDataVolume?: string;
    maxAPIRequests?: number;
  };
  limits?: any;
  limitsExceeded: boolean;
  usage?: any;
}

export default function LicenseManagementPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [licenseToken, setLicenseToken] = useState('');
  const [activationKey, setActivationKey] = useState('');

  useEffect(() => {
    fetchLicenseStatus();
  }, []);

  const fetchLicenseStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/license/status');
      const data = await response.json();

      if (data.success) {
        setLicenseStatus(data);
      } else {
        setLicenseStatus({ hasActiveLicense: false, limitsExceeded: false });
      }
    } catch (error) {
      console.error('Error fetching license status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch license status",
        variant: "destructive"
      });
      setLicenseStatus({ hasActiveLicense: false, limitsExceeded: false });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licenseToken.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a license token",
        variant: "destructive"
      });
      return;
    }

    try {
      setActivating(true);

      const response = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseToken: licenseToken.trim(),
          activationKey: activationKey.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "License Activated",
          description: `License "${data.data.licenseName}" has been activated successfully`,
        });

        // Clear form
        setLicenseToken('');
        setActivationKey('');

        // Refresh license status
        await fetchLicenseStatus();
      } else {
        toast({
          title: "Activation Failed",
          description: data.error || "Failed to activate license",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error activating license:', error);
      toast({
        title: "Activation Error",
        description: "Failed to activate license",
        variant: "destructive"
      });
    } finally {
      setActivating(false);
    }
  };

  const getStatusBadge = (status: string, isActive: boolean, isExpired: boolean) => {
    if (isExpired) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
    }

    if (isActive && status === 'ACTIVE') {
      return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    }

    if (status === 'PENDING_ACTIVATION') {
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending Activation</Badge>;
    }

    return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
  };

  const getLicenseTypeBadge = (type: string, level: string) => {
    const colorMap: { [key: string]: string } = {
      TRIAL: 'bg-blue-100 text-blue-800',
      STANDARD: 'bg-green-100 text-green-800',
      PROFESSIONAL: 'bg-purple-100 text-purple-800',
      ENTERPRISE: 'bg-orange-100 text-orange-800',
      GOVERNMENT: 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant="outline" className={colorMap[type] || 'bg-gray-100 text-gray-800'}>
        {type} - {level}
      </Badge>
    );
  };

  const getUsagePercentage = (current: number, max: number) => {
    if (!max) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-muted-foreground">Loading license information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            License Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your IDS Connector licenses and monitor feature access
          </p>
        </div>
        <Button onClick={fetchLicenseStatus} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activate">Activate License</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {licenseStatus?.hasActiveLicense ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* License Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    License Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {getStatusBadge(
                      licenseStatus.license!.status,
                      licenseStatus.license!.isActive,
                      licenseStatus.license!.isExpired
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Type:</span>
                    {getLicenseTypeBadge(
                      licenseStatus.license!.licenseType,
                      licenseStatus.license!.licenseLevel
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">License Name:</span>
                      <span className="text-sm font-medium">{licenseStatus.license!.licenseName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Organization:</span>
                      <span className="text-sm font-medium">{licenseStatus.license!.organizationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contact:</span>
                      <span className="text-sm font-medium">{licenseStatus.license!.contactEmail}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expiration & Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Expiration & Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Activated:</span>
                      <span className="text-sm font-medium">
                        {new Date(licenseStatus.license!.activationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expires:</span>
                      <span className="text-sm font-medium">
                        {new Date(licenseStatus.license!.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Days Remaining:</span>
                      <div className="flex items-center gap-2">
                        {licenseStatus.license!.isExpiringSoon && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          licenseStatus.license!.isExpiringSoon ? 'text-yellow-600' :
                          licenseStatus.license!.isExpired ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {licenseStatus.license!.daysUntilExpiration > 0
                            ? licenseStatus.license!.daysUntilExpiration
                            : 'Expired'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Used:</span>
                      <span className="text-sm font-medium">
                        {new Date(licenseStatus.license!.lastUsed).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Usage Count:</span>
                      <span className="text-sm font-medium">{licenseStatus.license!.usageCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active License</h3>
                <p className="text-muted-foreground text-center mb-6">
                  You need to activate a license to use advanced features of the IDS Connector Portal.
                </p>
                <Button onClick={() => window.location.href = '#activate'}>
                  <Key className="h-4 w-4 mr-2" />
                  Activate License
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Activate License
              </CardTitle>
              <CardDescription>
                Enter your license token to activate advanced features. Contact your administrator if you need help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleActivateLicense} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseToken">License Token *</Label>
                  <Input
                    id="licenseToken"
                    type="text"
                    placeholder="IDS-XXXX-XXXX-XXXX-XXXX"
                    value={licenseToken}
                    onChange={(e) => setLicenseToken(e.target.value)}
                    className="font-mono"
                    disabled={activating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the license token provided by your organization
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activationKey">Activation Key (Optional)</Label>
                  <Input
                    id="activationKey"
                    type="text"
                    placeholder="Enter activation key if required"
                    value={activationKey}
                    onChange={(e) => setActivationKey(e.target.value)}
                    className="font-mono"
                    disabled={activating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Some licenses require an additional activation key
                  </p>
                </div>

                <Button type="submit" disabled={activating} className="w-full">
                  {activating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Activating License...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Activate License
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* License Format Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">License Token Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  License tokens follow the format: <code className="bg-muted px-2 py-1 rounded">IDS-XXXX-XXXX-XXXX-XXXX</code>
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Example License Types:</h4>
                  <ul className="text-sm space-y-1">
                    <li><code>IDS-TRIAL-xxxx-xxxx-xxxx</code> - Trial License</li>
                    <li><code>IDS-STD-xxxx-xxxx-xxxx</code> - Standard License</li>
                    <li><code>IDS-PRO-xxxx-xxxx-xxxx</code> - Professional License</li>
                    <li><code>IDS-ENT-xxxx-xxxx-xxxx</code> - Enterprise License</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {licenseStatus?.hasActiveLicense ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Enabled Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {licenseStatus.license!.enabledFeatures.length > 0 ? (
                    <div className="space-y-2">
                      {licenseStatus.license!.enabledFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{feature.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">All features are enabled</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    Restricted Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {licenseStatus.license!.restrictedFeatures.length > 0 ? (
                    <div className="space-y-2">
                      {licenseStatus.license!.restrictedFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">{feature.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No restricted features</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No License Active</h3>
                <p className="text-muted-foreground text-center">
                  Activate a license to view available features.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {licenseStatus?.hasActiveLicense ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Limits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Usage Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {licenseStatus.limits?.users && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Users</span>
                        <span>{licenseStatus.limits.users.current} / {licenseStatus.limits.users.max}</span>
                      </div>
                      <Progress
                        value={getUsagePercentage(licenseStatus.limits.users.current, licenseStatus.limits.users.max)}
                        className="h-2"
                      />
                    </div>
                  )}

                  {licenseStatus.limits?.connectors && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Connectors</span>
                        <span>{licenseStatus.limits.connectors.current} / {licenseStatus.limits.connectors.max}</span>
                      </div>
                      <Progress
                        value={getUsagePercentage(licenseStatus.limits.connectors.current, licenseStatus.limits.connectors.max)}
                        className="h-2"
                      />
                    </div>
                  )}

                  {licenseStatus.limits?.apiRequests && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>API Requests (Daily)</span>
                        <span>{licenseStatus.limits.apiRequests.current} / {licenseStatus.limits.apiRequests.max}</span>
                      </div>
                      <Progress
                        value={getUsagePercentage(licenseStatus.limits.apiRequests.current, licenseStatus.limits.apiRequests.max)}
                        className="h-2"
                      />
                    </div>
                  )}

                  {licenseStatus.limits?.dataVolume && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Data Volume (30 days)</span>
                        <span>
                          {(Number(licenseStatus.limits.dataVolume.current) / (1024 * 1024)).toFixed(2)} MB /
                          {(Number(licenseStatus.limits.dataVolume.max) / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage(
                          Number(licenseStatus.limits.dataVolume.current),
                          Number(licenseStatus.limits.dataVolume.max)
                        )}
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {licenseStatus.usage?.totalUsage || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Operations</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {licenseStatus.usage?.totalApiCalls || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">API Calls</div>
                    </div>
                  </div>

                  {licenseStatus.usage?.usageByFeature && licenseStatus.usage.usageByFeature.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Top Features Used:</h4>
                      {licenseStatus.usage.usageByFeature.slice(0, 5).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.featureUsed.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{item._count.featureUsed}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Usage Data</h3>
                <p className="text-muted-foreground text-center">
                  Activate a license to view usage statistics and limits.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}