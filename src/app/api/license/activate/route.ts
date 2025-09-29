import { NextRequest, NextResponse } from 'next/server';
import { LicenseRepository } from '@/lib/database/repositories';

const licenseRepo = new LicenseRepository();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseToken, activationKey } = body;

    if (!licenseToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'License token is required'
        },
        { status: 400 }
      );
    }

    // Get client fingerprint
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '0.0.0.0';

    const clientFingerprint = `${userAgent}-${ipAddress}`;

    // Activate license
    const license = await licenseRepo.activateLicense(
      licenseToken,
      activationKey,
      clientFingerprint
    );

    return NextResponse.json({
      success: true,
      data: {
        id: license.id,
        licenseName: license.licenseName,
        licenseType: license.licenseType,
        licenseLevel: license.licenseLevel,
        status: license.status,
        isActive: license.isActive,
        activationDate: license.activationDate,
        expirationDate: license.expirationDate,
        organizationName: license.organizationName,
        enabledFeatures: license.enabledFeatures,
        maxUsers: license.maxUsers,
        maxConnectors: license.maxConnectors,
        maxDataVolume: license.maxDataVolume?.toString(),
        maxAPIRequests: license.maxAPIRequests
      },
      message: 'License activated successfully'
    });

  } catch (error) {
    console.error('Error activating license:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate license'
      },
      { status: 400 }
    );
  }
}