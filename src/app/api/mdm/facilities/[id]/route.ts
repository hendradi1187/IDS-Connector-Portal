import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


// GET - Get single facility by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const facility = await prisma.facility.findUnique({
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
            shape: true
          }
        },
        wells: {
          include: {
            well: {
              select: {
                id: true,
                uwi: true,
                wellName: true,
                currentClass: true,
                statusType: true,
                environmentType: true,
                totalDepth: true,
                spudDate: true
              }
            }
          }
        },
        fields: {
          include: {
            field: {
              select: {
                fieldId: true,
                fieldName: true,
                fieldType: true
              }
            }
          }
        },
        _count: {
          select: {
            wells: true,
            fields: true
          }
        }
      }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error fetching facility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update facility
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if facility exists
    const existingFacility = await prisma.facility.findUnique({
      where: { id: params.id }
    });

    if (!existingFacility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // If facilityId is being updated, check for uniqueness
    if (body.facilityId && body.facilityId !== existingFacility.facilityId) {
      const facilityWithSameId = await prisma.facility.findUnique({
        where: { facilityId: body.facilityId }
      });

      if (facilityWithSameId) {
        return NextResponse.json(
          { error: 'FACILITY_ID already exists' },
          { status: 409 }
        );
      }

      // Validate format
      const facilityIdRegex = /^[A-Z0-9_-]+$/;
      if (!facilityIdRegex.test(body.facilityId)) {
        return NextResponse.json(
          { error: 'FACILITY_ID must contain only uppercase letters, numbers, underscores, and hyphens' },
          { status: 400 }
        );
      }
    }

    // If wkId is being updated, verify it exists
    if (body.wkId && body.wkId !== existingFacility.wkId) {
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
    if (body.fieldId && body.fieldId !== existingFacility.fieldId) {
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

    // Validate dates if provided
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

    // Prepare update data
    const updateData: any = { updatedBy: body.updatedBy || null };

    // Only update provided fields
    const updatableFields = [
      'facilityId',
      'facilityName',
      'facilityType',
      'subType',
      'wkId',
      'fieldId',
      'operator',
      'status',
      'diameter',
      'length',
      'fluidType',
      'capacityProd',
      'waterDepth',
      'noOfWell',
      'vesselCapacity',
      'storageCapacity',
      'plantCapacity',
      'power',
      'longitude',
      'latitude',
      'shape'
    ];

    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (['diameter', 'length', 'capacityProd', 'waterDepth', 'vesselCapacity',
             'storageCapacity', 'plantCapacity', 'power', 'longitude', 'latitude'].includes(field)) {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else if (field === 'noOfWell') {
          updateData[field] = body[field] ? parseInt(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Handle date fields specifically
    if (body.installationDate !== undefined) {
      updateData.installationDate = body.installationDate ? new Date(body.installationDate) : null;
    }
    if (body.commissioningDate !== undefined) {
      updateData.commissioningDate = body.commissioningDate ? new Date(body.commissioningDate) : null;
    }

    const updatedFacility = await prisma.facility.update({
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
        },
        _count: {
          select: {
            wells: true,
            fields: true
          }
        }
      }
    });

    return NextResponse.json(updatedFacility);
  } catch (error) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete facility
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if facility exists
    const existingFacility = await prisma.facility.findUnique({
      where: { id: params.id }
    });

    if (!existingFacility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Check for related wells
    const relatedWells = await prisma.wellFacility.count({
      where: { facilityId: params.id }
    });

    if (relatedWells > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete facility with ${relatedWells} associated wells. Please remove well associations first.`
        },
        { status: 409 }
      );
    }

    // Check for related fields
    const relatedFields = await prisma.fieldFacility.count({
      where: { facilityId: params.id }
    });

    if (relatedFields > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete facility with ${relatedFields} associated fields. Please remove field associations first.`
        },
        { status: 409 }
      );
    }

    // Delete facility associations and then the facility
    await prisma.$transaction([
      prisma.wellFacility.deleteMany({
        where: { facilityId: params.id }
      }),
      prisma.fieldFacility.deleteMany({
        where: { facilityId: params.id }
      }),
      prisma.facility.delete({
        where: { id: params.id }
      })
    ]);

    return NextResponse.json(
      { message: 'Facility deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}