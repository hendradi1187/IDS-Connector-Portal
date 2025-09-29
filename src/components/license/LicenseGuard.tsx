'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  Key,
  AlertTriangle,
  Lock,
  CheckCircle,
  XCircle,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react';

interface LicenseGuardProps {
  children: React.ReactNode;
  featureName: string;
  fallbackComponent?: React.ComponentType;
  showLicenseInfo?: boolean;
  allowDemo?: boolean;
}

interface LicenseValidation {
  isValid: boolean;
  hasFeatureAccess: boolean;
  license?: {
    id: string;
    licenseName: string;
    licenseType: string;
    licenseLevel: string;
    status: string;
    expirationDate: string;
    enabledFeatures: string[];
    organizationName: string;
  };
  error?: string;
  limitExceeded?: boolean;
  limits?: any;
  loading: boolean;
}

export default function LicenseGuard({
  children,
  featureName,
  fallbackComponent,
  showLicenseInfo = true,
  allowDemo = false
}: LicenseGuardProps) {
  const [licenseStatus, setLicenseStatus] = useState<LicenseValidation>({
    isValid: false,
    hasFeatureAccess: false,
    loading: true
  });

  useEffect(() => {
    validateLicense();
  }, [featureName]);

  const validateLicense = async () => {
    try {
      setLicenseStatus(prev => ({ ...prev, loading: true }));

      const response = await fetch('/api/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureName })
      });

      const data = await response.json();

      setLicenseStatus({
        isValid: data.isValid,
        hasFeatureAccess: data.hasFeatureAccess,
        license: data.license,
        error: data.error,
        limitExceeded: data.limitExceeded,
        limits: data.limits,
        loading: false
      });

    } catch (error) {
      console.error('License validation error:', error);
      setLicenseStatus({
        isValid: false,
        hasFeatureAccess: false,
        error: 'Failed to validate license',
        loading: false
      });
    }
  };

  const getLicenseStatusBadge = () => {
    if (licenseStatus.limitExceeded) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Limit Exceeded</Badge>;
    }

    if (!licenseStatus.isValid) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Invalid License</Badge>;
    }

    if (!licenseStatus.hasFeatureAccess) {
      return <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Feature Restricted</Badge>;
    }

    return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Licensed</Badge>;
  };

  const getFeatureTypeBadge = (featureName: string) => {
    const featureTypes: { [key: string]: { color: string; label: string } } = {
      'ogc_osdu_adaptor': { color: 'bg-blue-100 text-blue-800', label: 'OGC-OSDU' },
      'external_services': { color: 'bg-green-100 text-green-800', label: 'External Services' },
      'advanced_routing': { color: 'bg-purple-100 text-purple-800', label: 'Advanced Routing' },
      'compliance_audit': { color: 'bg-orange-100 text-orange-800', label: 'Compliance' },
      'user_management': { color: 'bg-red-100 text-red-800', label: 'User Management' },
      'system_monitoring': { color: 'bg-yellow-100 text-yellow-800', label: 'Monitoring' },
      'api_management': { color: 'bg-indigo-100 text-indigo-800', label: 'API Management' },
      'custom_connectors': { color: 'bg-pink-100 text-pink-800', label: 'Custom Connectors' }
    };

    const feature = featureTypes[featureName] || { color: 'bg-gray-100 text-gray-800', label: 'Feature' };

    return (
      <Badge variant="outline" className={feature.color}>
        {feature.label}
      </Badge>
    );
  };

  // Loading state
  if (licenseStatus.loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Demo mode fallback (development only)
  if (allowDemo && process.env.NODE_ENV === 'development' && !licenseStatus.isValid) {
    return (
      <div className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <Zap className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Demo Mode</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Running in demo mode. Feature licensing is disabled in development.
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // License check failed
  if (!licenseStatus.isValid || !licenseStatus.hasFeatureAccess) {
    // Use custom fallback component if provided
    if (fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent />;
    }

    // Default license restriction UI
    return (
      <div className="space-y-6">
        {showLicenseInfo && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Lock className="h-5 w-5" />
                Feature Access Restricted
              </CardTitle>
              <CardDescription className="text-red-600">
                {getFeatureTypeBadge(featureName)} feature requires a valid license
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-700">License Status:</span>
                {getLicenseStatusBadge()}
              </div>

              {licenseStatus.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>License Error</AlertTitle>
                  <AlertDescription>{licenseStatus.error}</AlertDescription>
                </Alert>
              )}

              {licenseStatus.limitExceeded && licenseStatus.limits && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-red-700">Usage Limits Exceeded:</h4>
                  <div className="space-y-2">
                    {Object.entries(licenseStatus.limits).map(([key, limit]: [string, any]) => (
                      limit.exceeded && (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize text-red-600">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-medium text-red-800">
                            {limit.current} / {limit.max}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => window.location.href = '/license-management'}
                  className="flex-1"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Manage License
                </Button>
                <Button variant="outline" onClick={validateLicense}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder content for restricted feature */}
        <Card className="opacity-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              {getFeatureTypeBadge(featureName).props.children} Feature
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              This advanced feature is available with a valid license.
            </p>
            <div className="text-sm text-muted-foreground space-y-1 text-center">
              <p>✓ Enhanced security and compliance</p>
              <p>✓ Advanced integration capabilities</p>
              <p>✓ Professional support</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // License is valid and feature is accessible
  return (
    <div className="space-y-4">
      {showLicenseInfo && licenseStatus.license && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <span className="text-sm font-medium text-green-800">
                  Licensed Feature Active
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {getFeatureTypeBadge(featureName)}
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {licenseStatus.license.licenseType} - {licenseStatus.license.licenseLevel}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-green-600">
                Expires: {new Date(licenseStatus.license.expirationDate).toLocaleDateString()}
              </div>
              <div className="text-xs text-green-500">
                {licenseStatus.license.organizationName}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {children}
    </div>
  );
}

// Higher-order component for easy integration
export function withLicenseGuard(featureName: string, options?: {
  fallbackComponent?: React.ComponentType;
  showLicenseInfo?: boolean;
  allowDemo?: boolean;
}) {
  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    return function LicenseGuardedComponent(props: P) {
      return (
        <LicenseGuard
          featureName={featureName}
          fallbackComponent={options?.fallbackComponent}
          showLicenseInfo={options?.showLicenseInfo}
          allowDemo={options?.allowDemo}
        >
          <WrappedComponent {...props} />
        </LicenseGuard>
      );
    };
  };
}

// Hook for license validation in components
export function useLicenseValidation(featureName: string) {
  const [licenseStatus, setLicenseStatus] = useState<LicenseValidation>({
    isValid: false,
    hasFeatureAccess: false,
    loading: true
  });

  useEffect(() => {
    async function validateLicense() {
      try {
        const response = await fetch('/api/license/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featureName })
        });

        const data = await response.json();

        setLicenseStatus({
          isValid: data.isValid,
          hasFeatureAccess: data.hasFeatureAccess,
          license: data.license,
          error: data.error,
          limitExceeded: data.limitExceeded,
          limits: data.limits,
          loading: false
        });

      } catch (error) {
        setLicenseStatus({
          isValid: false,
          hasFeatureAccess: false,
          error: 'Failed to validate license',
          loading: false
        });
      }
    }

    validateLicense();
  }, [featureName]);

  return licenseStatus;
}