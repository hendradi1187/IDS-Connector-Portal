import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


// GET - Get single field by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const field = await prisma.field.findUnique({
      where: { id: params.id },
      include: {
        workingArea: {
          select: {
            namaWk: true,
            holding: true,
            shape: true
          }
        },
        wells: {
          select: {
            id: true,
            uwi: true,
            wellName: true,
            currentClass: true,
            statusType: true,
            environmentType: true,
            totalDepth: true,
            spudDate: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        facilities: {
          include: {
            facility: {
              select: {
                facilityName: true,
                facilityType: true,
                operationalStatus: true
              }
            }
          }
        },
        _count: {
          select: {
            wells: true,
            facilities: true
          }
        }
      }
    });

    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(field);
  } catch (error) {
    console.error('Error fetching field:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update field
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if field exists
    const existingField = await prisma.field.findUnique({
      where: { id: params.id }
    });

    if (!existingField) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      );
    }

    // If fieldId is being updated, check for uniqueness
    if (body.fieldId && body.fieldId !== existingField.fieldId) {
      const fieldWithSameId = await prisma.field.findUnique({
        where: { fieldId: body.fieldId }
      });

      if (fieldWithSameId) {
        return NextResponse.json(
          { error: 'FIELD_ID already exists' },
          { status: 409 }
        );
      }

      // Validate format
      const fieldIdRegex = /^[A-Z0-9_-]+$/;
      if (!fieldIdRegex.test(body.fieldId)) {
        return NextResponse.json(
          { error: 'FIELD_ID must contain only uppercase letters, numbers, underscores, and hyphens' },
          { status: 400 }
        );
      }
    }

    // If wkId is being updated, verify it exists
    if (body.wkId && body.wkId !== existingField.wkId) {
      const workingArea = await prisma.workingArea.findUnique({
        where: { wkId: body.wkId }
      });

      if (!workingArea) {
        return NextResponse.json(
          { error: 'Working Area (WK_ID) not found' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = { updatedBy: body.updatedBy || null };

    // Only update provided fields
    const updatableFields = [
      'fieldId',
      'fieldName',
      'wkId',
      'basin',
      'formationName',
      'fieldType',
      'status',
      'operator',
      'isOffshore',
      'shape',
      'reservoirType',
      'estimatedReserves',
      'currentProduction'
    ];

    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (['estimatedReserves', 'currentProduction'].includes(field)) {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Handle date field specifically
    if (body.discoveryDate !== undefined) {
      updateData.discoveryDate = body.discoveryDate ? new Date(body.discoveryDate) : null;
    }

    const updatedField = await prisma.field.update({
      where: { id: params.id },
      data: updateData,
      include: {
        workingArea: {
          select: {
            namaWk: true,
            holding: true
          }
        },
        _count: {
          select: {
            wells: true,
            facilities: true
          }
        }
      }
    });

    return NextResponse.json(updatedField);
  } catch (error) {
    console.error('Error updating field:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete field
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if field exists
    const existingField = await prisma.field.findUnique({
      where: { id: params.id }
    });

    if (!existingField) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      );
    }

    // Check for related wells
    const relatedWells = await prisma.well.count({
      where: { fieldId: existingField.fieldId }
    });

    if (relatedWells > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete field with ${relatedWells} associated wells. Please remove well associations first.`
        },
        { status: 409 }
      );
    }

    // Check for related facilities
    const relatedFacilities = await prisma.fieldFacility.count({
      where: { fieldId: existingField.id }
    });

    if (relatedFacilities > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete field with ${relatedFacilities} associated facilities. Please remove facility associations first.`
        },
        { status: 409 }
      );
    }

    // Delete field facilities and then the field
    await prisma.fieldFacility.deleteMany({
      where: { fieldId: params.id }
    });

    await prisma.field.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Field deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting field:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}