import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uwi, excludeId } = body;

    if (!uwi) {
      return NextResponse.json(
        { error: 'UWI is required' },
        { status: 400 }
      );
    }

    // Validate format
    const uwiRegex = /^[A-Z0-9_-]+$/;
    const formatValid = uwiRegex.test(uwi);

    if (!formatValid) {
      return NextResponse.json({
        valid: false,
        error: 'UWI must contain only uppercase letters, numbers, underscores, and hyphens'
      });
    }

    // Check uniqueness
    const whereClause: any = { uwi };

    // If excludeId is provided (for updates), exclude that record
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existingWell = await prisma.well.findFirst({
      where: whereClause
    });

    if (existingWell) {
      return NextResponse.json({
        valid: false,
        error: 'UWI already exists'
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'UWI is valid and available'
    });
  } catch (error) {
    console.error('Error validating UWI:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}