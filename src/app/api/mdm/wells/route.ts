import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


// GET - List wells with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const wkId = searchParams.get('wkId') || '';
    const fieldId = searchParams.get('fieldId') || '';
    const currentClass = searchParams.get('currentClass') || '';
    const statusType = searchParams.get('statusType') || '';
    const environmentType = searchParams.get('environmentType') || '';
    const operator = searchParams.get('operator') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { uwi: { contains: search, mode: 'insensitive' } },
        { wellName: { contains: search, mode: 'insensitive' } },
        { operator: { contains: search, mode: 'insensitive' } },
        { fieldId: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (wkId) {
      where.wkId = wkId;
    }

    if (fieldId) {
      where.fieldId = fieldId;
    }

    if (currentClass) {
      where.currentClass = currentClass;
    }

    if (statusType) {
      where.statusType = statusType;
    }

    if (environmentType) {
      where.environmentType = environmentType;
    }

    if (operator) {
      where.operator = { contains: operator, mode: 'insensitive' };
    }

    // Get total count for pagination
    const total = await prisma.well.count({ where });

    // Get wells
    const wells = await prisma.well.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { createdAt: 'desc' }
      ],
      include: {
        workingArea: {
          select: {
            namaWk: true,
            holding: true
          }
        },
        field: {
          select: {
            fieldName: true,
            fieldType: true
          }
        }
      }
    });

    return NextResponse.json({
      data: wells,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching wells:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new well
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'uwi',
      'wkId',
      'wellName',
      'operator',
      'currentClass',
      'statusType',
      'environmentType',
      'profileType',
      'surfaceLongitude',
      'surfaceLatitude',
      'shape'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate UWI format (should be unique identifier)
    const uwiRegex = /^[A-Z0-9_-]+$/;
    if (!uwiRegex.test(body.uwi)) {
      return NextResponse.json(
        { error: 'UWI must contain only uppercase letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    // Check if UWI already exists
    const existingWell = await prisma.well.findUnique({
      where: { uwi: body.uwi }
    });

    if (existingWell) {
      return NextResponse.json(
        { error: 'UWI already exists' },
        { status: 409 }
      );
    }

    // Verify working area exists
    const workingArea = await prisma.workingArea.findUnique({
      where: { wkId: body.wkId }
    });

    if (!workingArea) {
      return NextResponse.json(
        { error: 'Working Area (WK_ID) not found' },
        { status: 400 }
      );
    }

    // Verify field exists if provided
    if (body.fieldId) {
      const field = await prisma.field.findUnique({
        where: { fieldId: body.fieldId }
      });

      if (!field) {
        return NextResponse.json(
          { error: 'Field (FIELD_ID) not found' },
          { status: 400 }
        );
      }
    }

    // Validate coordinates
    if (body.surfaceLongitude < -180 || body.surfaceLongitude > 180) {
      return NextResponse.json(
        { error: 'Surface longitude must be between -180 and 180' },
        { status: 400 }
      );
    }

    if (body.surfaceLatitude < -90 || body.surfaceLatitude > 90) {
      return NextResponse.json(
        { error: 'Surface latitude must be between -90 and 90' },
        { status: 400 }
      );
    }

    // Validate dates
    if (body.spudDate && body.finalDrillDate) {
      const spudDate = new Date(body.spudDate);
      const finalDrillDate = new Date(body.finalDrillDate);

      if (finalDrillDate < spudDate) {
        return NextResponse.json(
          { error: 'Final drill date cannot be earlier than spud date' },
          { status: 400 }
        );
      }
    }

    // Create well
    const well = await prisma.well.create({
      data: {
        uwi: body.uwi,
        wkId: body.wkId,
        fieldId: body.fieldId || null,
        wellName: body.wellName,
        operator: body.operator,
        currentClass: body.currentClass,
        statusType: body.statusType,
        environmentType: body.environmentType,
        profileType: body.profileType,
        spudDate: body.spudDate ? new Date(body.spudDate) : null,
        finalDrillDate: body.finalDrillDate ? new Date(body.finalDrillDate) : null,
        surfaceLongitude: parseFloat(body.surfaceLongitude),
        surfaceLatitude: parseFloat(body.surfaceLatitude),
        nsUtm: body.nsUtm ? parseFloat(body.nsUtm) : null,
        ewUtm: body.ewUtm ? parseFloat(body.ewUtm) : null,
        utmEpsg: body.utmEpsg || null,
        shape: body.shape,
        totalDepth: body.totalDepth ? parseFloat(body.totalDepth) : null,
        waterDepth: body.waterDepth ? parseFloat(body.waterDepth) : null,
        kellyBushingElevation: body.kellyBushingElevation ? parseFloat(body.kellyBushingElevation) : null,
        createdBy: body.createdBy || null,
        updatedBy: body.updatedBy || null
      },
      include: {
        workingArea: {
          select: {
            namaWk: true,
            holding: true
          }
        },
        field: {
          select: {
            fieldName: true,
            fieldType: true
          }
        }
      }
    });

    return NextResponse.json(well, { status: 201 });
  } catch (error) {
    console.error('Error creating well:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}