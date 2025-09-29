import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


// GET - Get single well by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const well = await prisma.well.findUnique({
      where: { id: params.id },
      include: {
        workingArea: {
          select: {
            namaWk: true,
            holding: true,
            shape: true
          }
        },
        field: {
          select: {
            fieldName: true,
            fieldType: true,
            fieldStatus: true,
            shape: true
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
        }
      }
    });

    if (!well) {
      return NextResponse.json(
        { error: 'Well not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(well);
  } catch (error) {
    console.error('Error fetching well:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update well
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if well exists
    const existingWell = await prisma.well.findUnique({
      where: { id: params.id }
    });

    if (!existingWell) {
      return NextResponse.json(
        { error: 'Well not found' },
        { status: 404 }
      );
    }

    // If UWI is being updated, check for uniqueness
    if (body.uwi && body.uwi !== existingWell.uwi) {
      const wellWithSameUwi = await prisma.well.findUnique({
        where: { uwi: body.uwi }
      });

      if (wellWithSameUwi) {
        return NextResponse.json(
          { error: 'UWI already exists' },
          { status: 409 }
        );
      }

      // Validate format
      const uwiRegex = /^[A-Z0-9_-]+$/;
      if (!uwiRegex.test(body.uwi)) {
        return NextResponse.json(
          { error: 'UWI must contain only uppercase letters, numbers, underscores, and hyphens' },
          { status: 400 }
        );
      }
    }

    // If wkId is being updated, verify it exists
    if (body.wkId && body.wkId !== existingWell.wkId) {
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

    // If fieldId is being updated, verify it exists
    if (body.fieldId && body.fieldId !== existingWell.fieldId) {
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

    // Validate coordinates if provided
    if (body.surfaceLongitude !== undefined) {
      if (body.surfaceLongitude < -180 || body.surfaceLongitude > 180) {
        return NextResponse.json(
          { error: 'Surface longitude must be between -180 and 180' },
          { status: 400 }
        );
      }
    }

    if (body.surfaceLatitude !== undefined) {
      if (body.surfaceLatitude < -90 || body.surfaceLatitude > 90) {
        return NextResponse.json(
          { error: 'Surface latitude must be between -90 and 90' },
          { status: 400 }
        );
      }
    }

    // Validate dates if provided
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

    // Prepare update data
    const updateData: any = { updatedBy: body.updatedBy || null };

    // Only update provided fields
    const updatableFields = [
      'uwi',
      'wkId',
      'fieldId',
      'wellName',
      'operator',
      'currentClass',
      'statusType',
      'environmentType',
      'profileType',
      'surfaceLongitude',
      'surfaceLatitude',
      'nsUtm',
      'ewUtm',
      'utmEpsg',
      'shape',
      'totalDepth',
      'waterDepth',
      'kellyBushingElevation'
    ];

    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (['surfaceLongitude', 'surfaceLatitude', 'nsUtm', 'ewUtm', 'totalDepth', 'waterDepth', 'kellyBushingElevation'].includes(field)) {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Handle date fields specifically
    if (body.spudDate !== undefined) {
      updateData.spudDate = body.spudDate ? new Date(body.spudDate) : null;
    }
    if (body.finalDrillDate !== undefined) {
      updateData.finalDrillDate = body.finalDrillDate ? new Date(body.finalDrillDate) : null;
    }

    const updatedWell = await prisma.well.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedWell);
  } catch (error) {
    console.error('Error updating well:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete well
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if well exists
    const existingWell = await prisma.well.findUnique({
      where: { id: params.id }
    });

    if (!existingWell) {
      return NextResponse.json(
        { error: 'Well not found' },
        { status: 404 }
      );
    }

    // Check for related facilities
    const relatedFacilities = await prisma.wellFacility.count({
      where: { wellId: params.id }
    });

    if (relatedFacilities > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete well with associated facilities. Please remove facility associations first.'
        },
        { status: 409 }
      );
    }

    // Delete well facilities first (if any)
    await prisma.wellFacility.deleteMany({
      where: { wellId: params.id }
    });

    // Delete the well
    await prisma.well.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Well deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting well:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}