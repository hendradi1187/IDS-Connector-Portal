import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { LicenseRepository } from '@/lib/database/repositories/licenseRepository';
import { LicenseUsageType } from '@prisma/client';

const licenseRepo = new LicenseRepository();

export interface LicenseValidationOptions {
  featureName?: string;
  requireActive?: boolean;
  logUsage?: boolean;
  usageType?: LicenseUsageType;
  skipValidation?: boolean; // For development/testing
}

export interface LicenseValidationResult {
  isValid: boolean;
  hasFeatureAccess: boolean;
  license?: any;
  error?: string;
  limitExceeded?: boolean;
  limits?: any;
}

/**
 * Main license validation middleware
 */
export async function validateLicense(
  request: NextRequest,
  options: LicenseValidationOptions = {}
): Promise<LicenseValidationResult> {
  const {
    featureName,
    requireActive = true,
    logUsage = true,
    usageType = LicenseUsageType.FEATURE_ACCESS,
    skipValidation = false
  } = options;

  // Skip validation in development mode if specified
  if (skipValidation && process.env.NODE_ENV === 'development') {
    return {
      isValid: true,
      hasFeatureAccess: true,
      error: 'Validation skipped in development mode'
    };
  }

  try {
    // Get license token from headers or session
    const licenseToken = await getLicenseToken(request);

    if (!licenseToken) {
      return {
        isValid: false,
        hasFeatureAccess: false,
        error: 'No license token found. Please activate a license.'
      };
    }

    // Validate license
    const validation = await licenseRepo.validateLicense(licenseToken, featureName);

    if (!validation.isValid) {
      return validation;
    }

    // Check license limits
    const limitsCheck = await licenseRepo.checkLicenseLimits(licenseToken);

    if (!limitsCheck.isValid) {
      return {
        isValid: false,
        hasFeatureAccess: false,
        error: 'License limits exceeded',
        limitExceeded: true,
        limits: limitsCheck.limits
      };
    }

    // Log usage if enabled and feature is specified
    if (logUsage && featureName) {
      try {
        const clientInfo = getClientInfo(request);
        await licenseRepo.logFeatureUsage(
          licenseToken,
          featureName,
          usageType,
          clientInfo.userId,
          clientInfo.sessionId,
          clientInfo.ipAddress,
          clientInfo.userAgent
        );
      } catch (logError) {
        console.warn('Failed to log license usage:', logError);
        // Don't fail the validation just because logging failed
      }
    }

    return {
      isValid: true,
      hasFeatureAccess: validation.hasFeatureAccess,
      license: validation.license,
      limits: limitsCheck.limits
    };

  } catch (error) {
    console.error('License validation error:', error);
    return {
      isValid: false,
      hasFeatureAccess: false,
      error: `License validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Express-style middleware wrapper
 */
export function createLicenseMiddleware(options: LicenseValidationOptions = {}) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const validation = await validateLicense(request, options);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          licenseRequired: true,
          limitExceeded: validation.limitExceeded,
          limits: validation.limits
        },
        { status: validation.limitExceeded ? 429 : 403 }
      );
    }

    if (!validation.hasFeatureAccess) {
      return NextResponse.json(
        {
          success: false,
          error: `Feature '${options.featureName}' is not enabled in your license`,
          licenseRequired: true,
          featureRestricted: true
        },
        { status: 403 }
      );
    }

    // Validation passed, continue to next middleware/handler
    return null;
  };
}

/**
 * React Hook for license validation
 */
export async function useLicenseValidation(featureName?: string) {
  try {
    const response = await fetch('/api/license/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureName })
    });

    const result = await response.json();

    return {
      isValid: result.isValid,
      hasFeatureAccess: result.hasFeatureAccess,
      license: result.license,
      error: result.error,
      limitExceeded: result.limitExceeded,
      limits: result.limits,
      loading: false
    };

  } catch (error) {
    return {
      isValid: false,
      hasFeatureAccess: false,
      error: 'Failed to validate license',
      loading: false
    };
  }
}

/**
 * Feature Access HOC for React Components
 */
export function withLicenseCheck(featureName: string, fallbackComponent?: React.ComponentType) {
  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    return function LicenseCheckedComponent(props: P) {
      const [licenseStatus, setLicenseStatus] = React.useState<{
        isValid: boolean;
        hasFeatureAccess: boolean;
        loading: boolean;
        error?: string;
      }>({
        isValid: false,
        hasFeatureAccess: false,
        loading: true
      });

      React.useEffect(() => {
        async function checkLicense() {
          const result = await useLicenseValidation(featureName);
          setLicenseStatus(result);
        }
        checkLicense();
      }, []);

      if (licenseStatus.loading) {
        return <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>;
      }

      if (!licenseStatus.isValid || !licenseStatus.hasFeatureAccess) {
        if (fallbackComponent) {
          const FallbackComponent = fallbackComponent;
          return <FallbackComponent />;
        }

        return (
          <div className="flex items-center justify-center p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    License Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{licenseStatus.error || `Feature '${featureName}' requires a valid license.`}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return <WrappedComponent {...props} />;
    };
  };
}

/**
 * Get license token from request
 */
async function getLicenseToken(request: NextRequest): Promise<string | null> {
  // Try to get from headers first
  const headerToken = request.headers.get('x-license-token');
  if (headerToken) {
    return headerToken;
  }

  // Try to get from database (current active license)
  try {
    const currentLicense = await licenseRepo.getCurrentLicense();
    return currentLicense?.licenseToken || null;
  } catch (error) {
    console.error('Failed to get current license:', error);
    return null;
  }
}

/**
 * Extract client information from request
 */
function getClientInfo(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   '0.0.0.0';

  const userAgent = request.headers.get('user-agent') || '';
  const sessionId = request.headers.get('x-session-id');
  const userId = request.headers.get('x-user-id');

  return {
    ipAddress,
    userAgent,
    sessionId,
    userId
  };
}

/**
 * Pre-defined feature names for consistent usage
 */
export const FEATURES = {
  // Core Features
  DATA_UPLOAD: 'data_upload',
  DATA_DOWNLOAD: 'data_download',
  DATA_ACCESS: 'data_access',
  REQUEST_MANAGEMENT: 'request_management',

  // Advanced Features
  OGC_OSDU_ADAPTOR: 'ogc_osdu_adaptor',
  EXTERNAL_SERVICES: 'external_services',
  COMPLIANCE_AUDIT: 'compliance_audit',
  ADVANCED_ROUTING: 'advanced_routing',

  // Enterprise Features
  USER_MANAGEMENT: 'user_management',
  SYSTEM_MONITORING: 'system_monitoring',
  API_MANAGEMENT: 'api_management',
  CUSTOM_CONNECTORS: 'custom_connectors',

  // Analytics Features
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOM_REPORTS: 'custom_reports',
  DATA_VISUALIZATION: 'data_visualization',
  EXPORT_FUNCTIONALITY: 'export_functionality'
} as const;

export type FeatureName = typeof FEATURES[keyof typeof FEATURES];

/**
 * License validation decorator for API routes
 */
export function requireLicense(featureName?: string, options: LicenseValidationOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0] as NextRequest;

      const validation = await validateLicense(request, {
        ...options,
        featureName
      });

      if (!validation.isValid || !validation.hasFeatureAccess) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error,
            licenseRequired: true,
            limitExceeded: validation.limitExceeded
          },
          { status: validation.limitExceeded ? 429 : 403 }
        );
      }

      // Add license info to request context
      (request as any).license = validation.license;
      (request as any).licenseLimits = validation.limits;

      return method.apply(this, args);
    };

    return descriptor;
  };
}