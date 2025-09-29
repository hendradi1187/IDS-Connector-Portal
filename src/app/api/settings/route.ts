import { NextRequest, NextResponse } from 'next/server';

// Mock settings storage - in production, this would use a database
let settings = {
  refreshInterval: 30,
  maxFileSize: 10,
  enableNotifications: true,
  autoBackup: false,
  coordinateSystem: 'EPSG:4326',
  dataValidation: true,
  complianceChecking: true,
  geometryValidation: true,
  sessionTimeout: 60,
  auditLogging: true,
  dataEncryption: true,
  updatedAt: new Date().toISOString()
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { message: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'refreshInterval',
      'maxFileSize',
      'coordinateSystem',
      'sessionTimeout'
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    if (body.refreshInterval < 10 || body.refreshInterval > 300) {
      return NextResponse.json(
        { message: 'Refresh interval must be between 10 and 300 seconds' },
        { status: 400 }
      );
    }

    if (body.maxFileSize < 1 || body.maxFileSize > 100) {
      return NextResponse.json(
        { message: 'Max file size must be between 1 and 100 MB' },
        { status: 400 }
      );
    }

    if (body.sessionTimeout < 15 || body.sessionTimeout > 480) {
      return NextResponse.json(
        { message: 'Session timeout must be between 15 and 480 minutes' },
        { status: 400 }
      );
    }

    // Validate coordinate system
    const validCoordinateSystems = [
      'EPSG:4326',
      'EPSG:3857',
      'EPSG:32748',
      'EPSG:32749'
    ];

    if (!validCoordinateSystems.includes(body.coordinateSystem)) {
      return NextResponse.json(
        { message: 'Invalid coordinate system' },
        { status: 400 }
      );
    }

    // Update settings
    settings = {
      ...settings,
      ...body,
      updatedAt: new Date().toISOString()
    };

    // Log the settings update
    console.log('Settings updated:', {
      updatedBy: 'system', // In production, would get from auth
      timestamp: settings.updatedAt,
      changes: Object.keys(body)
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json(
      { message: 'Failed to save settings' },
      { status: 500 }
    );
  }
}