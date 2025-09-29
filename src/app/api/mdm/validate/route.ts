/**
 * Centralized Validation API Endpoint
 * Endpoint untuk validasi data MDM secara terpusat
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { MdmValidator, ValidationContext } from '@/lib/validation/mdm-validators';
import { BusinessRuleValidators, DataIntegrityValidators } from '@/lib/middleware/validation-middleware';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, data, operation = 'create', options = {} } = body;

    if (!domain || !data) {
      return NextResponse.json(
        { error: 'Domain and data are required' },
        { status: 400 }
      );
    }

    // Validate domain
    const validDomains = ['workingArea', 'seismicSurvey', 'well', 'field', 'facility'];
    if (!validDomains.includes(domain)) {
      return NextResponse.json(
        { error: `Invalid domain. Must be one of: ${validDomains.join(', ')}` },
        { status: 400 }
      );
    }

    const validationResults = {
      mandatory: { isValid: true, errors: [], warnings: [] },
      businessRules: { isValid: true, errors: [] },
      dataIntegrity: { isValid: true, errors: [] },
      overall: { isValid: true, errors: [], warnings: [] }
    };

    // 1. Mandatory fields and basic validation
    const context: ValidationContext = { operation };
    const mandatoryResult = await MdmValidator.validateData(domain, data, context, prisma);

    validationResults.mandatory = mandatoryResult;
    validationResults.overall.errors.push(...mandatoryResult.errors);
    if (mandatoryResult.warnings) {
      validationResults.overall.warnings.push(...mandatoryResult.warnings);
    }

    // 2. Business rules validation (if mandatory validation passes)
    if (mandatoryResult.isValid && !options.skipBusinessRules) {
      let businessErrors: string[] = [];

      switch (domain) {
        case 'workingArea':
          businessErrors = await BusinessRuleValidators.validateWorkingAreaBusinessRules(data);
          break;
        case 'well':
          businessErrors = await BusinessRuleValidators.validateWellBusinessRules(data);
          break;
        case 'field':
          businessErrors = await BusinessRuleValidators.validateFieldBusinessRules(data);
          break;
        case 'facility':
          businessErrors = await BusinessRuleValidators.validateFacilityBusinessRules(data);
          break;
        case 'seismicSurvey':
          businessErrors = await BusinessRuleValidators.validateSeismicSurveyBusinessRules(data);
          break;
      }

      validationResults.businessRules.errors = businessErrors;
      validationResults.businessRules.isValid = businessErrors.length === 0;
      validationResults.overall.errors.push(...businessErrors);
    }

    // 3. Data integrity validation (if previous validations pass)
    if (mandatoryResult.isValid && validationResults.businessRules.isValid && !options.skipDataIntegrity) {
      const crossRefErrors = await DataIntegrityValidators.validateCrossReferences(data, domain);
      const geometryErrors = data.shape ? await DataIntegrityValidators.validateGeometryConsistency(data, domain) : [];

      const integrityErrors = [...crossRefErrors, ...geometryErrors];
      validationResults.dataIntegrity.errors = integrityErrors;
      validationResults.dataIntegrity.isValid = integrityErrors.length === 0;
      validationResults.overall.errors.push(...integrityErrors);
    }

    // Overall validation result
    validationResults.overall.isValid =
      validationResults.mandatory.isValid &&
      validationResults.businessRules.isValid &&
      validationResults.dataIntegrity.isValid;

    // Generate validation summary
    const summary = {
      domain,
      operation,
      timestamp: new Date().toISOString(),
      status: validationResults.overall.isValid ? 'VALID' : 'INVALID',
      errorCount: validationResults.overall.errors.length,
      warningCount: validationResults.overall.warnings.length,
      checkedRules: {
        mandatory: true,
        businessRules: !options.skipBusinessRules,
        dataIntegrity: !options.skipDataIntegrity
      }
    };

    return NextResponse.json({
      valid: validationResults.overall.isValid,
      summary,
      results: validationResults,
      errors: validationResults.overall.errors,
      warnings: validationResults.overall.warnings
    });

  } catch (error) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during validation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'rules':
      return NextResponse.json({
        domains: ['workingArea', 'seismicSurvey', 'well', 'field', 'facility'],
        validationTypes: ['mandatory', 'businessRules', 'dataIntegrity'],
        rules: {
          workingArea: {
            mandatory: [
              'WK_ID (unique identifier)',
              'WK_NAME (working area name)',
              'KKKS_NAME (contractor name)',
              'WK_TYPE (PSC/JOB/other)',
              'BASIN (geological basin)',
              'PROVINCE (administrative)',
              'CONTRACTOR_NAME',
              'SHAPE (WGS 84 geometry)'
            ],
            businessRules: [
              'Area must be between 0.01 - 50,000 km²',
              'PSC type must have contractor',
              'Geometry must be Polygon/MultiPolygon'
            ]
          },
          well: {
            mandatory: [
              'UWI (format: AAAAA-BBBBB-CC)',
              'WELL_NAME',
              'WK_ID (must exist)',
              'CURRENT_CLASS',
              'STATUS_TYPE',
              'ENVIRONMENT_TYPE',
              'SURFACE_LONGITUDE/LATITUDE (Indonesia range)',
              'OPERATOR',
              'SHAPE (Point geometry)'
            ],
            businessRules: [
              'Producing wells need completion date',
              'Offshore wells need water depth',
              'Total depth > kick-off depth',
              'Spud date must be reasonable'
            ]
          },
          field: {
            mandatory: [
              'FIELD_ID (unique)',
              'FIELD_NAME',
              'WK_ID (must exist)',
              'FIELD_TYPE (OIL/GAS/OIL_GAS/CONDENSATE)',
              'BASIN',
              'OPERATOR',
              'STATUS',
              'SHAPE (Polygon geometry)'
            ],
            businessRules: [
              'Production fields need reserves data',
              'Discovery date < first production date',
              'Offshore fields need water depth'
            ]
          },
          facility: {
            mandatory: [
              'FACILITY_ID (unique)',
              'FACILITY_NAME',
              'FACILITY_TYPE',
              'WK_ID (must exist)',
              'OPERATOR',
              'STATUS',
              'SHAPE (geometry based on type)'
            ],
            businessRules: [
              'Production facilities need capacity',
              'Pipelines need diameter & length',
              'Offshore platforms need water depth',
              'Storage facilities need capacity'
            ]
          },
          seismicSurvey: {
            mandatory: [
              'SEIS_ACQTN_SURVEY_ID (unique)',
              'ACQTN_SURVEY_NAME',
              'WK_ID (must exist)',
              'SEIS_DIMENSION (2D/3D)',
              'ENVIRONMENT (ONSHORE/OFFSHORE/TRANSITION_ZONE)',
              'SHOT_BY',
              'SHAPE (geometry)'
            ],
            businessRules: [
              'Survey duration 1 day - 10 years',
              '3D surveys should have area',
              'Offshore surveys need marine contractor',
              '2D = LineString, 3D = Polygon'
            ]
          }
        }
      });

    case 'stats':
      // Get validation statistics
      try {
        const stats = {
          totalValidations: 0, // You can track this in a separate table
          domains: {
            workingArea: { validated: 0, errors: 0 },
            seismicSurvey: { validated: 0, errors: 0 },
            well: { validated: 0, errors: 0 },
            field: { validated: 0, errors: 0 },
            facility: { validated: 0, errors: 0 }
          },
          commonErrors: [
            'Missing mandatory fields',
            'Invalid geometry format',
            'Foreign key constraint violations',
            'Business rule violations'
          ],
          lastUpdated: new Date().toISOString()
        };

        return NextResponse.json(stats);
      } catch (error) {
        console.error('Error fetching validation stats:', error);
        return NextResponse.json(
          { error: 'Failed to fetch validation statistics' },
          { status: 500 }
        );
      }

    default:
      return NextResponse.json({
        message: 'MDM Validation API',
        endpoints: {
          'POST /': 'Validate MDM data',
          'GET /?action=rules': 'Get validation rules',
          'GET /?action=stats': 'Get validation statistics'
        },
        usage: {
          validate: {
            method: 'POST',
            body: {
              domain: 'workingArea | seismicSurvey | well | field | facility',
              data: 'object to validate',
              operation: 'create | update',
              options: {
                skipBusinessRules: 'boolean (optional)',
                skipDataIntegrity: 'boolean (optional)'
              }
            }
          }
        }
      });
  }
}