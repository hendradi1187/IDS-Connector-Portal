import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


// GET - List seismic surveys with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const wkId = searchParams.get('wkId') || '';
    const seisDimension = searchParams.get('seisDimension') || '';
    const environment = searchParams.get('environment') || '';
    const shotBy = searchParams.get('shotBy') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { seisAcqtnSurveyId: { contains: search, mode: 'insensitive' } },
        { acqtnSurveyName: { contains: search, mode: 'insensitive' } },
        { baLongName: { contains: search, mode: 'insensitive' } },
        { projectId: { contains: search, mode: 'insensitive' } },
        { shotBy: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (wkId) {
      where.wkId = wkId;
    }

    if (seisDimension) {
      where.seisDimension = seisDimension;
    }

    if (environment) {
      where.environment = environment;
    }

    if (shotBy) {
      where.shotBy = { contains: shotBy, mode: 'insensitive' };
    }

    // Get total count for pagination
    const total = await prisma.seismicSurvey.count({ where });

    // Get seismic surveys
    const seismicSurveys = await prisma.seismicSurvey.findMany({
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
        }
      }
    });

    return NextResponse.json({
      data: seismicSurveys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching seismic surveys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new seismic survey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'seisAcqtnSurveyId',
      'acqtnSurveyName',
      'baLongName',
      'wkId',
      'seisDimension',
      'environment',
      'seisLineType',
      'shape'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate SEIS_ACQTN_SURVEY_ID format (should be unique identifier)
    const seisIdRegex = /^[A-Z0-9_-]+$/;
    if (!seisIdRegex.test(body.seisAcqtnSurveyId)) {
      return NextResponse.json(
        { error: 'SEIS_ACQTN_SURVEY_ID must contain only uppercase letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    // Check if seisAcqtnSurveyId already exists
    const existingSurvey = await prisma.seismicSurvey.findUnique({
      where: { seisAcqtnSurveyId: body.seisAcqtnSurveyId }
    });

    if (existingSurvey) {
      return NextResponse.json(
        { error: 'SEIS_ACQTN_SURVEY_ID already exists' },
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

    // Validate dates
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

    // Create seismic survey
    const seismicSurvey = await prisma.seismicSurvey.create({
      data: {
        seisAcqtnSurveyId: body.seisAcqtnSurveyId,
        acqtnSurveyName: body.acqtnSurveyName,
        baLongName: body.baLongName,
        wkId: body.wkId,
        projectId: body.projectId || null,
        projectLevel: body.projectLevel || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        completedDate: body.completedDate ? new Date(body.completedDate) : null,
        shotBy: body.shotBy || null,
        seisDimension: body.seisDimension,
        environment: body.environment,
        seisLineType: body.seisLineType,
        crsRemark: body.crsRemark || 'WGS 84, EPSG:4326',
        shape: body.shape,
        shapeArea: body.shapeArea || null,
        shapeLength: body.shapeLength || null,
        crsEpsg: body.crsEpsg || 4326,
        dataQuality: body.dataQuality || null,
        processingStatus: body.processingStatus || null,
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

    return NextResponse.json(seismicSurvey, { status: 201 });
  } catch (error) {
    console.error('Error creating seismic survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}