/**
 * Validation Middleware untuk MDM Hulu Migas
 * Implementasi middleware untuk validasi otomatis pada semua API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MdmValidator, ValidationContext } from '../validation/mdm-validators';

const prisma = new PrismaClient();

export interface ValidationMiddlewareOptions {
  domain: 'workingArea' | 'seismicSurvey' | 'well' | 'field' | 'facility';
  operation: 'create' | 'update';
  skipForeignKeys?: boolean;
  customValidators?: ((data: any) => Promise<string[]>)[];
}

/**
 * Middleware untuk validasi data sebelum operasi database
 */
export async function validateMdmData(
  request: NextRequest,
  options: ValidationMiddlewareOptions,
  params?: { id?: string }
): Promise<NextResponse | null> {
  try {
    const body = await request.json();

    // Prepare validation context
    const context: ValidationContext = {
      operation: options.operation,
      existingData: params?.id ? await getExistingData(options.domain, params.id) : undefined
    };

    // Run main validation
    const validationResult = await MdmValidator.validateData(
      options.domain,
      body,
      context,
      options.skipForeignKeys ? undefined : prisma
    );

    // Run custom validators if provided
    if (options.customValidators && options.customValidators.length > 0) {
      for (const validator of options.customValidators) {
        const customErrors = await validator(body);
        validationResult.errors.push(...customErrors);
      }
    }

    // Check for validation errors
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.errors,
          warnings: validationResult.warnings
        },
        { status: 400 }
      );
    }

    // Validation passed, continue to next handler
    return null;

  } catch (error) {
    console.error('Validation middleware error:', error);
    return NextResponse.json(
      { error: 'Validation middleware error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get existing data for update operations
 */
async function getExistingData(domain: string, id: string): Promise<any> {
  switch (domain) {
    case 'workingArea':
      return await prisma.workingArea.findUnique({ where: { id } });
    case 'seismicSurvey':
      return await prisma.seismicSurvey.findUnique({ where: { id } });
    case 'well':
      return await prisma.well.findUnique({ where: { id } });
    case 'field':
      return await prisma.field.findUnique({ where: { id } });
    case 'facility':
      return await prisma.facility.findUnique({ where: { id } });
    default:
      return null;
  }
}

/**
 * Business Rules Validators
 * Custom validators untuk business logic specific
 */
export class BusinessRuleValidators {

  /**
   * Validate Working Area business rules
   */
  static async validateWorkingAreaBusinessRules(data: any): Promise<string[]> {
    const errors: string[] = [];

    // Business rule: Area must be reasonable (not too small or too large)
    if (data.area) {
      if (data.area < 0.01) {
        errors.push('Working Area cannot be smaller than 0.01 km²');
      }
      if (data.area > 50000) {
        errors.push('Working Area cannot be larger than 50,000 km²');
      }
    }

    // Business rule: PSC type working areas must have contractor
    if (data.wkType === 'PSC' && !data.contractorName) {
      errors.push('PSC type Working Areas must have a contractor name');
    }

    return errors;
  }

  /**
   * Validate Well business rules
   */
  static async validateWellBusinessRules(data: any): Promise<string[]> {
    const errors: string[] = [];

    // Business rule: Producing wells must have completion date
    if (data.statusType === 'PRODUCING' && !data.completionDate) {
      errors.push('Producing wells must have a completion date');
    }

    // Business rule: Offshore wells must have water depth
    if (data.environmentType === 'OFFSHORE' && !data.waterDepth) {
      errors.push('Offshore wells must have water depth specified');
    }

    // Business rule: Total depth consistency check
    if (data.totalDepth && data.kickOffDepth && data.totalDepth < data.kickOffDepth) {
      errors.push('Total depth cannot be less than kick-off depth');
    }

    // Business rule: Spud date must be reasonable (not in future, not too old)
    if (data.spudDate) {
      const spudDate = new Date(data.spudDate);
      const now = new Date();
      const hundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());

      if (spudDate > now) {
        errors.push('Spud date cannot be in the future');
      }
      if (spudDate < hundredYearsAgo) {
        errors.push('Spud date cannot be more than 100 years ago');
      }
    }

    return errors;
  }

  /**
   * Validate Field business rules
   */
  static async validateFieldBusinessRules(data: any): Promise<string[]> {
    const errors: string[] = [];

    // Business rule: Production fields must have reserves data
    if (data.status === 'PRODUCTION') {
      if (!data.oilReserves && !data.gasReserves) {
        errors.push('Production fields must have either oil or gas reserves data');
      }
    }

    // Business rule: Discovery date must be before first production
    if (data.discoveryDate && data.firstProductionDate) {
      const discovery = new Date(data.discoveryDate);
      const firstProd = new Date(data.firstProductionDate);

      if (firstProd < discovery) {
        errors.push('First production date cannot be earlier than discovery date');
      }
    }

    // Business rule: Offshore fields must have water depth info
    if (data.isOffshore && !data.waterDepth) {
      errors.push('Offshore fields must have water depth information');
    }

    return errors;
  }

  /**
   * Validate Facility business rules
   */
  static async validateFacilityBusinessRules(data: any): Promise<string[]> {
    const errors: string[] = [];

    // Business rule: Production facilities must have capacity
    const productionTypes = ['PLATFORM', 'PROCESSING_PLANT', 'FLOATING_FACILITY'];
    if (productionTypes.includes(data.facilityType)) {
      if (!data.capacityProd && !data.plantCapacity) {
        errors.push('Production facilities must have capacity information');
      }
    }

    // Business rule: Pipeline facilities must have technical specs
    if (data.facilityType === 'PIPELINE') {
      if (!data.diameter || !data.length) {
        errors.push('Pipeline facilities must have diameter and length specified');
      }
      if (data.diameter && (data.diameter < 2 || data.diameter > 60)) {
        errors.push('Pipeline diameter must be between 2 and 60 inches');
      }
    }

    // Business rule: Offshore facilities must have water depth
    if (data.facilityType === 'PLATFORM' && data.subType?.includes('OFFSHORE') && !data.waterDepth) {
      errors.push('Offshore platforms must have water depth specified');
    }

    // Business rule: Storage facilities must have capacity
    if (data.facilityType === 'STORAGE_TANK' && !data.storageCapacity) {
      errors.push('Storage facilities must have storage capacity specified');
    }

    return errors;
  }

  /**
   * Validate Seismic Survey business rules
   */
  static async validateSeismicSurveyBusinessRules(data: any): Promise<string[]> {
    const errors: string[] = [];

    // Business rule: Survey duration validation
    if (data.startDate && data.completedDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.completedDate);
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

      if (diffDays < 1) {
        errors.push('Survey duration must be at least 1 day');
      }
      if (diffDays > 3650) { // 10 years
        errors.push('Survey duration cannot exceed 10 years');
      }
    }

    // Business rule: 3D surveys should have area info
    if (data.seisDimension === '3D' && !data.surveyArea) {
      errors.push('3D surveys should have survey area specified');
    }

    // Business rule: Offshore surveys must specify marine contractor
    if (data.environment === 'OFFSHORE' && !data.marineContractor) {
      errors.push('Offshore surveys must specify marine contractor');
    }

    return errors;
  }
}

/**
 * Data Integrity Validators
 * Validators untuk memastikan integritas data lintas domain
 */
export class DataIntegrityValidators {

  /**
   * Validate referential integrity across domains
   */
  static async validateCrossReferences(data: any, domain: string): Promise<string[]> {
    const errors: string[] = [];

    switch (domain) {
      case 'well':
        // Check if well's field is in the same working area
        if (data.fieldId && data.wkId) {
          const field = await prisma.field.findUnique({
            where: { fieldId: data.fieldId }
          });

          if (field && field.wkId !== data.wkId) {
            errors.push(`Well's field (${data.fieldId}) is not in the same working area (${data.wkId})`);
          }
        }
        break;

      case 'facility':
        // Check if facility's field is in the same working area
        if (data.fieldId && data.wkId) {
          const field = await prisma.field.findUnique({
            where: { fieldId: data.fieldId }
          });

          if (field && field.wkId !== data.wkId) {
            errors.push(`Facility's field (${data.fieldId}) is not in the same working area (${data.wkId})`);
          }
        }
        break;
    }

    return errors;
  }

  /**
   * Validate geometry consistency
   */
  static async validateGeometryConsistency(data: any, domain: string): Promise<string[]> {
    const errors: string[] = [];

    try {
      const geometry = JSON.parse(data.shape);

      switch (domain) {
        case 'well':
          // Wells should be points
          if (geometry.type !== 'Point') {
            errors.push('Well geometry must be a Point');
          }
          break;

        case 'seismicSurvey':
          // Seismic surveys can be LineString (2D) or Polygon (3D)
          if (data.seisDimension === '2D' && geometry.type !== 'LineString') {
            errors.push('2D seismic survey geometry should be LineString');
          }
          if (data.seisDimension === '3D' && !['Polygon', 'MultiPolygon'].includes(geometry.type)) {
            errors.push('3D seismic survey geometry should be Polygon or MultiPolygon');
          }
          break;

        case 'field':
          // Fields should be polygons
          if (!['Polygon', 'MultiPolygon'].includes(geometry.type)) {
            errors.push('Field geometry should be Polygon or MultiPolygon');
          }
          break;

        case 'facility':
          // Validate facility geometry based on type
          if (data.facilityType === 'PIPELINE' && geometry.type !== 'LineString') {
            errors.push('Pipeline facility geometry should be LineString');
          }
          break;
      }

    } catch (e) {
      errors.push('Invalid geometry format');
    }

    return errors;
  }
}