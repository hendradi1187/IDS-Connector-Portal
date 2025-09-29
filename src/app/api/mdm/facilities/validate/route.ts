import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilityId, excludeId } = body;

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    // Validate format
    const facilityIdRegex = /^[A-Z0-9_-]+$/;
    const formatValid = facilityIdRegex.test(facilityId);

    if (!formatValid) {
      return NextResponse.json({
        valid: false,
        error: 'FACILITY_ID must contain only uppercase letters, numbers, underscores, and hyphens'
      });
    }

    // Check uniqueness
    const whereClause: any = { facilityId };

    // If excludeId is provided (for updates), exclude that record
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existingFacility = await prisma.facility.findFirst({
      where: whereClause
    });

    if (existingFacility) {
      return NextResponse.json({
        valid: false,
        error: 'FACILITY_ID already exists'
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'FACILITY_ID is valid and available'
    });
  } catch (error) {
    console.error('Error validating facility ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}