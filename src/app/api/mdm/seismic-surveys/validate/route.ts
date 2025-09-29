import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seisAcqtnSurveyId, excludeId } = body;

    if (!seisAcqtnSurveyId) {
      return NextResponse.json(
        { error: 'seisAcqtnSurveyId is required' },
        { status: 400 }
      );
    }

    // Validate format
    const seisIdRegex = /^[A-Z0-9_-]+$/;
    const formatValid = seisIdRegex.test(seisAcqtnSurveyId);

    if (!formatValid) {
      return NextResponse.json({
        valid: false,
        error: 'SEIS_ACQTN_SURVEY_ID must contain only uppercase letters, numbers, underscores, and hyphens'
      });
    }

    // Check uniqueness
    const whereClause: any = { seisAcqtnSurveyId };

    // If excludeId is provided (for updates), exclude that record
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existingSurvey = await prisma.seismicSurvey.findFirst({
      where: whereClause
    });

    if (existingSurvey) {
      return NextResponse.json({
        valid: false,
        error: 'SEIS_ACQTN_SURVEY_ID already exists'
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'SEIS_ACQTN_SURVEY_ID is valid and available'
    });
  } catch (error) {
    console.error('Error validating seismic survey ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}