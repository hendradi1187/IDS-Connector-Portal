import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fieldId, excludeId } = body;

    if (!fieldId) {
      return NextResponse.json(
        { error: 'fieldId is required' },
        { status: 400 }
      );
    }

    // Validate format
    const fieldIdRegex = /^[A-Z0-9_-]+$/;
    const formatValid = fieldIdRegex.test(fieldId);

    if (!formatValid) {
      return NextResponse.json({
        valid: false,
        error: 'FIELD_ID must contain only uppercase letters, numbers, underscores, and hyphens'
      });
    }

    // Check uniqueness
    const whereClause: any = { fieldId };

    // If excludeId is provided (for updates), exclude that record
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existingField = await prisma.field.findFirst({
      where: whereClause
    });

    if (existingField) {
      return NextResponse.json({
        valid: false,
        error: 'FIELD_ID already exists'
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'FIELD_ID is valid and available'
    });
  } catch (error) {
    console.error('Error validating field ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}