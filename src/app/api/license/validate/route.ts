import { NextRequest, NextResponse } from 'next/server';
import { validateLicense } from '@/lib/middleware/validateLicense';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureName } = body;

    const validation = await validateLicense(request, {
      featureName,
      logUsage: true
    });

    return NextResponse.json({
      success: true,
      isValid: validation.isValid,
      hasFeatureAccess: validation.hasFeatureAccess,
      license: validation.license ? {
        id: validation.license.id,
        licenseName: validation.license.licenseName,
        licenseType: validation.license.licenseType,
        licenseLevel: validation.license.licenseLevel,
        status: validation.license.status,
        expirationDate: validation.license.expirationDate,
        enabledFeatures: validation.license.enabledFeatures,
        organizationName: validation.license.organizationName
      } : null,
      error: validation.error,
      limitExceeded: validation.limitExceeded,
      limits: validation.limits
    });

  } catch (error) {
    console.error('Error validating license:', error);
    return NextResponse.json(
      {
        success: false,
        isValid: false,
        hasFeatureAccess: false,
        error: 'License validation failed'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featureName = searchParams.get('featureName');

    const validation = await validateLicense(request, {
      featureName: featureName || undefined,
      logUsage: false // Don't log for GET requests
    });

    return NextResponse.json({
      success: true,
      isValid: validation.isValid,
      hasFeatureAccess: validation.hasFeatureAccess,
      license: validation.license ? {
        id: validation.license.id,
        licenseName: validation.license.licenseName,
        licenseType: validation.license.licenseType,
        licenseLevel: validation.license.licenseLevel,
        status: validation.license.status,
        expirationDate: validation.license.expirationDate,
        enabledFeatures: validation.license.enabledFeatures,
        organizationName: validation.license.organizationName,
        maxUsers: validation.license.maxUsers,
        maxConnectors: validation.license.maxConnectors,
        maxDataVolume: validation.license.maxDataVolume?.toString(),
        maxAPIRequests: validation.license.maxAPIRequests
      } : null,
      error: validation.error,
      limitExceeded: validation.limitExceeded,
      limits: validation.limits
    });

  } catch (error) {
    console.error('Error getting license status:', error);
    return NextResponse.json(
      {
        success: false,
        isValid: false,
        hasFeatureAccess: false,
        error: 'Failed to get license status'
      },
      { status: 500 }
    );
  }
}