import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


// GET - List facilities with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const wkId = searchParams.get('wkId') || '';
    const fieldId = searchParams.get('fieldId') || '';
    const facilityType = searchParams.get('facilityType') || '';
    const status = searchParams.get('status') || '';
    const operator = searchParams.get('operator') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { facilityId: { contains: search, mode: 'insensitive' } },
        { facilityName: { contains: search, mode: 'insensitive' } },
        { operator: { contains: search, mode: 'insensitive' } },
        { subType: { contains: search, mode: 'insensitive' } },
        { fluidType: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (wkId) {
      where.wkId = wkId;
    }

    if (fieldId) {
      where.fieldId = fieldId;
    }

    if (facilityType) {
      where.facilityType = facilityType;
    }

    if (status) {
      where.status = status;
    }

    if (operator) {
      where.operator = { contains: operator, mode: 'insensitive' };
    }

    // Get total count for pagination
    const total = await prisma.facility.count({ where });

    // Get facilities
    const facilities = await prisma.facility.findMany({
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
        },
        wells: {
          select: {
            well: {
              select: {
                uwi: true,
                wellName: true,
                statusType: true
              }
            }
          },
          take: 3 // Limit to first 3 wells for preview
        },
        _count: {
          select: {
            wells: true,
            fields: true
          }
        }
      }
    });

    return NextResponse.json({
      data: facilities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new facility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'facilityId',
      'facilityName',
      'facilityType',
      'wkId',
      'operator',
      'status',
      'shape'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate FACILITY_ID format (should be unique identifier)
    const facilityIdRegex = /^[A-Z0-9_-]+$/;
    if (!facilityIdRegex.test(body.facilityId)) {
      return NextResponse.json(
        { error: 'FACILITY_ID must contain only uppercase letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    // Check if facilityId already exists
    const existingFacility = await prisma.facility.findUnique({
      where: { facilityId: body.facilityId }
    });

    if (existingFacility) {
      return NextResponse.json(
        { error: 'FACILITY_ID already exists' },
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

    // Validate dates
    if (body.installationDate && body.commissioningDate) {
      const installationDate = new Date(body.installationDate);
      const commissioningDate = new Date(body.commissioningDate);

      if (commissioningDate < installationDate) {
        return NextResponse.json(
          { error: 'Commissioning date cannot be earlier than installation date' },
          { status: 400 }
        );
      }
    }

    // Create facility
    const facility = await prisma.facility.create({
      data: {
        facilityId: body.facilityId,
        facilityName: body.facilityName,
        facilityType: body.facilityType,
        subType: body.subType || null,
        wkId: body.wkId,
        fieldId: body.fieldId || null,
        operator: body.operator,
        status: body.status,
        installationDate: body.installationDate ? new Date(body.installationDate) : null,
        commissioningDate: body.commissioningDate ? new Date(body.commissioningDate) : null,
        // Pipeline specific fields
        diameter: body.diameter ? parseFloat(body.diameter) : null,
        length: body.length ? parseFloat(body.length) : null,
        fluidType: body.fluidType || null,
        // Platform specific fields
        capacityProd: body.capacityProd ? parseFloat(body.capacityProd) : null,
        waterDepth: body.waterDepth ? parseFloat(body.waterDepth) : null,
        noOfWell: body.noOfWell ? parseInt(body.noOfWell) : null,
        // Floating facility specific fields
        vesselCapacity: body.vesselCapacity ? parseFloat(body.vesselCapacity) : null,
        // Processing plant specific fields
        storageCapacity: body.storageCapacity ? parseFloat(body.storageCapacity) : null,
        plantCapacity: body.plantCapacity ? parseFloat(body.plantCapacity) : null,
        power: body.power ? parseFloat(body.power) : null,
        // Coordinates and geometry
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        shape: body.shape,
        // Audit fields
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

    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}