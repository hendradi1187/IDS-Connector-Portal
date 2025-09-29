import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


// GET - List fields with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const wkId = searchParams.get('wkId') || '';
    const fieldType = searchParams.get('fieldType') || '';
    const status = searchParams.get('status') || '';
    const operator = searchParams.get('operator') || '';
    const isOffshore = searchParams.get('isOffshore') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { fieldId: { contains: search, mode: 'insensitive' } },
        { fieldName: { contains: search, mode: 'insensitive' } },
        { operator: { contains: search, mode: 'insensitive' } },
        { basin: { contains: search, mode: 'insensitive' } },
        { formationName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (wkId) {
      where.wkId = wkId;
    }

    if (fieldType) {
      where.fieldType = fieldType;
    }

    if (status) {
      where.status = status;
    }

    if (operator) {
      where.operator = { contains: operator, mode: 'insensitive' };
    }

    if (isOffshore) {
      where.isOffshore = isOffshore === 'true';
    }

    // Get total count for pagination
    const total = await prisma.field.count({ where });

    // Get fields
    const fields = await prisma.field.findMany({
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
        wells: {
          select: {
            id: true,
            uwi: true,
            wellName: true,
            statusType: true
          },
          take: 5 // Limit to first 5 wells for preview
        },
        _count: {
          select: {
            wells: true,
            facilities: true
          }
        }
      }
    });

    return NextResponse.json({
      data: fields,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new field
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'fieldId',
      'fieldName',
      'wkId',
      'fieldType',
      'status',
      'operator',
      'isOffshore',
      'shape'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate FIELD_ID format (should be unique identifier)
    const fieldIdRegex = /^[A-Z0-9_-]+$/;
    if (!fieldIdRegex.test(body.fieldId)) {
      return NextResponse.json(
        { error: 'FIELD_ID must contain only uppercase letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    // Check if fieldId already exists
    const existingField = await prisma.field.findUnique({
      where: { fieldId: body.fieldId }
    });

    if (existingField) {
      return NextResponse.json(
        { error: 'FIELD_ID already exists' },
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

    // Create field
    const field = await prisma.field.create({
      data: {
        fieldId: body.fieldId,
        fieldName: body.fieldName,
        wkId: body.wkId,
        basin: body.basin || null,
        formationName: body.formationName || null,
        discoveryDate: body.discoveryDate ? new Date(body.discoveryDate) : null,
        fieldType: body.fieldType,
        status: body.status,
        operator: body.operator,
        isOffshore: body.isOffshore,
        shape: body.shape,
        reservoirType: body.reservoirType || null,
        estimatedReserves: body.estimatedReserves ? parseFloat(body.estimatedReserves) : null,
        currentProduction: body.currentProduction ? parseFloat(body.currentProduction) : null,
        createdBy: body.createdBy || null,
        updatedBy: body.updatedBy || null
      },
      include: {
        workingArea: {
          select: {
            namaWk: true,
            holding: true
          }
        }
      }
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    console.error('Error creating field:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}