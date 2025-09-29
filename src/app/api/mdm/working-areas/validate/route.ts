import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

// POST /api/mdm/working-areas/validate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wkId, id } = body;

    if (!wkId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Working Area ID is required',
          message: 'wkId field is required for validation'
        },
        { status: 400 }
      );
    }

    // Check if WK_ID already exists (excluding current record if updating)
    const existingWorkingArea = await prisma.workingArea.findUnique({
      where: { wkId }
    });

    let isValid = true;
    let message = 'Working Area ID is available';

    if (existingWorkingArea) {
      // If we're updating and the existing record is the same as current record
      if (id && existingWorkingArea.id === id) {
        isValid = true;
        message = 'Working Area ID is valid for current record';
      } else {
        isValid = false;
        message = `Working Area ID ${wkId} already exists`;
      }
    }

    // Additional validations
    const validationResults = {
      wkIdUnique: isValid,
      wkIdFormat: /^[A-Z0-9\-_]+$/.test(wkId), // Alphanumeric with hyphens/underscores
      wkIdLength: wkId.length >= 3 && wkId.length <= 50
    };

    const allValid = Object.values(validationResults).every(v => v);

    return NextResponse.json({
      success: true,
      data: {
        isValid: allValid,
        message: allValid ? 'Working Area ID is valid' : 'Working Area ID validation failed',
        details: {
          wkIdUnique: {
            valid: validationResults.wkIdUnique,
            message: validationResults.wkIdUnique ? 'ID is unique' : `ID ${wkId} already exists`
          },
          wkIdFormat: {
            valid: validationResults.wkIdFormat,
            message: validationResults.wkIdFormat ? 'Format is valid' : 'ID must contain only alphanumeric characters, hyphens, and underscores'
          },
          wkIdLength: {
            valid: validationResults.wkIdLength,
            message: validationResults.wkIdLength ? 'Length is valid' : 'ID must be between 3 and 50 characters'
          }
        }
      }
    });

  } catch (error) {
    console.error('Error validating working area:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate working area',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}