import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


// GET - Get single seismic survey by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const seismicSurvey = await prisma.seismicSurvey.findUnique({
      where: { id: params.id },
      include: {
        workingArea: {
          select: {
            namaWk: true,
            holding: true,
            shape: true
          }
        }
      }
    });

    if (!seismicSurvey) {
      return NextResponse.json(
        { error: 'Seismic survey not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(seismicSurvey);
  } catch (error) {
    console.error('Error fetching seismic survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update seismic survey
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if seismic survey exists
    const existingSurvey = await prisma.seismicSurvey.findUnique({
      where: { id: params.id }
    });

    if (!existingSurvey) {
      return NextResponse.json(
        { error: 'Seismic survey not found' },
        { status: 404 }
      );
    }

    // If seisAcqtnSurveyId is being updated, check for uniqueness
    if (body.seisAcqtnSurveyId && body.seisAcqtnSurveyId !== existingSurvey.seisAcqtnSurveyId) {
      const surveyWithSameId = await prisma.seismicSurvey.findUnique({
        where: { seisAcqtnSurveyId: body.seisAcqtnSurveyId }
      });

      if (surveyWithSameId) {
        return NextResponse.json(
          { error: 'SEIS_ACQTN_SURVEY_ID already exists' },
          { status: 409 }
        );
      }

      // Validate format
      const seisIdRegex = /^[A-Z0-9_-]+$/;
      if (!seisIdRegex.test(body.seisAcqtnSurveyId)) {
        return NextResponse.json(
          { error: 'SEIS_ACQTN_SURVEY_ID must contain only uppercase letters, numbers, underscores, and hyphens' },
          { status: 400 }
        );
      }
    }

    // If wkId is being updated, verify it exists
    if (body.wkId && body.wkId !== existingSurvey.wkId) {
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

    // Validate dates if provided
    if (body.startDate && body.completedDate) {
      const startDate = new Date(body.startDate);
      const completedDate = new Date(body.completedDate);

      if (completedDate < startDate) {
        return NextResponse.json(
          { error: 'Completed date cannot be earlier than start date' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = { updatedBy: body.updatedBy || null };

    // Only update provided fields
    const updatableFields = [
      'seisAcqtnSurveyId',
      'acqtnSurveyName',
      'baLongName',
      'wkId',
      'projectId',
      'projectLevel',
      'shotBy',
      'seisDimension',
      'environment',
      'seisLineType',
      'crsRemark',
      'shape',
      'shapeArea',
      'shapeLength',
      'crsEpsg',
      'dataQuality',
      'processingStatus'
    ];

    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'startDate' || field === 'completedDate') {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Handle date fields specifically
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    }
    if (body.completedDate !== undefined) {
      updateData.completedDate = body.completedDate ? new Date(body.completedDate) : null;
    }

    const updatedSurvey = await prisma.seismicSurvey.update({
      where: { id: params.id },
      data: updateData,
      include: {
        workingArea: {
          select: {
            namaWk: true,
            holding: true
          }
        }
      }
    });

    return NextResponse.json(updatedSurvey);
  } catch (error) {
    console.error('Error updating seismic survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete seismic survey
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if seismic survey exists
    const existingSurvey = await prisma.seismicSurvey.findUnique({
      where: { id: params.id }
    });

    if (!existingSurvey) {
      return NextResponse.json(
        { error: 'Seismic survey not found' },
        { status: 404 }
      );
    }

    // TODO: Check for related records that might prevent deletion
    // For example, if there are seismic lines or other related data

    await prisma.seismicSurvey.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Seismic survey deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting seismic survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}