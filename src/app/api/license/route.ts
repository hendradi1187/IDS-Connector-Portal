import { NextRequest, NextResponse } from 'next/server';
import { LicenseRepository } from '@/lib/database/repositories';

const licenseRepo = new LicenseRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const licenses = await licenseRepo.getAllLicenses(includeInactive);

    return NextResponse.json({
      success: true,
      data: licenses
    });

  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch licenses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      licenseName,
      licenseType,
      licenseLevel,
      organizationName,
      organizationId,
      contactEmail,
      expirationDate,
      maxUsers,
      maxConnectors,
      maxDataVolume,
      maxAPIRequests,
      enabledFeatures,
      restrictedFeatures,
      metadata
    } = body;

    // Validate required fields
    if (!licenseName || !licenseType || !licenseLevel || !organizationName || !contactEmail || !expirationDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: licenseName, licenseType, licenseLevel, organizationName, contactEmail, expirationDate'
        },
        { status: 400 }
      );
    }

    // Create new license
    const license = await licenseRepo.createLicense({
      licenseName,
      licenseType,
      licenseLevel,
      organizationName,
      organizationId,
      contactEmail,
      expirationDate: new Date(expirationDate),
      maxUsers,
      maxConnectors,
      maxDataVolume: maxDataVolume ? BigInt(maxDataVolume) : undefined,
      maxAPIRequests,
      enabledFeatures: enabledFeatures || [],
      restrictedFeatures: restrictedFeatures || [],
      metadata
    });

    return NextResponse.json({
      success: true,
      data: license,
      message: 'License created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create license',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}