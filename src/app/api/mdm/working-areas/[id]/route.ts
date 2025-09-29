import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

// GET /api/mdm/working-areas/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const workingArea = await prisma.workingArea.findUnique({
      where: { id },
      include: {
        fields: true,
        wells: true,
        seismicSurveys: true,
        facilities: true,
        _count: {
          select: {
            fields: true,
            wells: true,
            seismicSurveys: true,
            facilities: true,
          }
        }
      }
    });

    if (!workingArea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Working Area not found',
          message: `Working Area with ID ${id} not found`
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workingArea
    });

  } catch (error) {
    console.error('Error fetching working area:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch working area',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/mdm/working-areas/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if working area exists
    const existingWorkingArea = await prisma.workingArea.findUnique({
      where: { id }
    });

    if (!existingWorkingArea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Working Area not found',
          message: `Working Area with ID ${id} not found`
        },
        { status: 404 }
      );
    }

    // Check if wkId is being changed and if new wkId already exists
    if (body.wkId && body.wkId !== existingWorkingArea.wkId) {
      const wkIdExists = await prisma.workingArea.findUnique({
        where: { wkId: body.wkId }
      });

      if (wkIdExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Working Area ID already exists',
            message: `Working Area with ID ${body.wkId} already exists`
          },
          { status: 409 }
        );
      }
    }

    // Update working area
    const workingArea = await prisma.workingArea.update({
      where: { id },
      data: {
        ...(body.wkId && { wkId: body.wkId }),
        ...(body.namaWk && { namaWk: body.namaWk }),
        ...(body.statusWk && { statusWk: body.statusWk }),
        ...(body.provinsi1 !== undefined && { provinsi1: body.provinsi1 }),
        ...(body.provinsi2 !== undefined && { provinsi2: body.provinsi2 }),
        ...(body.lokasi && { lokasi: body.lokasi }),
        ...(body.jenisKontrak && { jenisKontrak: body.jenisKontrak }),
        ...(body.effectiveDate && { effectiveDate: new Date(body.effectiveDate) }),
        ...(body.expireDate !== undefined && {
          expireDate: body.expireDate ? new Date(body.expireDate) : null
        }),
        ...(body.holding && { holding: body.holding }),
        ...(body.faseWk && { faseWk: body.faseWk }),
        ...(body.luasWkAwal !== undefined && { luasWkAwal: body.luasWkAwal }),
        ...(body.luasWk !== undefined && { luasWk: body.luasWk }),
        ...(body.namaCekungan !== undefined && { namaCekungan: body.namaCekungan }),
        ...(body.statusCekungan !== undefined && { statusCekungan: body.statusCekungan }),
        ...(body.participatingInterest !== undefined && { participatingInterest: body.participatingInterest }),
        ...(body.kewenangan && { kewenangan: body.kewenangan }),
        ...(body.attachment !== undefined && { attachment: body.attachment }),
        ...(body.shape && { shape: body.shape }),
        ...(body.crsEpsg !== undefined && { crsEpsg: body.crsEpsg }),
        ...(body.updatedBy && { updatedBy: body.updatedBy })
      }
    });

    return NextResponse.json({
      success: true,
      data: workingArea,
      message: 'Working Area updated successfully'
    });

  } catch (error) {
    console.error('Error updating working area:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update working area',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/mdm/working-areas/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if working area exists
    const existingWorkingArea = await prisma.workingArea.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            fields: true,
            wells: true,
            seismicSurveys: true,
            facilities: true,
          }
        }
      }
    });

    if (!existingWorkingArea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Working Area not found',
          message: `Working Area with ID ${id} not found`
        },
        { status: 404 }
      );
    }

    // Check if working area has related data
    const hasRelatedData =
      existingWorkingArea._count.fields > 0 ||
      existingWorkingArea._count.wells > 0 ||
      existingWorkingArea._count.seismicSurveys > 0 ||
      existingWorkingArea._count.facilities > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete working area',
          message: 'Working area has related fields, wells, seismic surveys, or facilities. Please delete related data first.',
          relatedCounts: existingWorkingArea._count
        },
        { status: 400 }
      );
    }

    // Delete working area
    await prisma.workingArea.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Working Area deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting working area:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete working area',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}