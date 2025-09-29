/**
 * MDM Hulu Migas Validation Library
 * Implementasi validasi mandatory fields dan foreign key relationships
 * sesuai SKK Migas Data Specification v2
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationContext {
  operation: 'create' | 'update';
  existingData?: any;
  skipConstraints?: string[];
}

/**
 * Working Area (Wilayah Kerja) Validators
 */
export class WorkingAreaValidator {
  static validateMandatoryFields(data: any): ValidationResult {
    const errors: string[] = [];

    // Mandatory fields per SKK Migas Data Spec v2
    const mandatoryFields = [
      { field: 'wkId', label: 'WK_ID' },
      { field: 'wkName', label: 'WK_NAME' },
      { field: 'kkksName', label: 'KKKS_NAME' },
      { field: 'wkType', label: 'WK_TYPE' },
      { field: 'basin', label: 'BASIN' },
      { field: 'province', label: 'PROVINCE' },
      { field: 'contractorName', label: 'CONTRACTOR_NAME' },
      { field: 'shape', label: 'SHAPE (Geometry)' }
    ];

    mandatoryFields.forEach(({ field, label }) => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${label} is required and cannot be empty`);
      }
    });

    // WK_ID format validation
    if (data.wkId && !/^[A-Z0-9_-]+$/.test(data.wkId)) {
      errors.push('WK_ID must contain only uppercase letters, numbers, underscores, and hyphens');
    }

    // Area validation (must be positive number)
    if (data.area && (isNaN(data.area) || data.area <= 0)) {
      errors.push('Area must be a positive number');
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateGeometry(shape: string): ValidationResult {
    const errors: string[] = [];

    try {
      const geometry = JSON.parse(shape);

      // Must be valid GeoJSON
      if (!geometry.type || !geometry.coordinates) {
        errors.push('Geometry must be valid GeoJSON with type and coordinates');
      }

      // For working area, typically Polygon
      if (geometry.type && !['Polygon', 'MultiPolygon'].includes(geometry.type)) {
        errors.push('Working Area geometry should be Polygon or MultiPolygon');
      }

      // Validate WGS 84 coordinate range
      if (geometry.coordinates) {
        this.validateCoordinateRange(geometry.coordinates, errors);
      }

    } catch (e) {
      errors.push('Geometry must be valid JSON');
    }

    return { isValid: errors.length === 0, errors };
  }

  private static validateCoordinateRange(coordinates: any, errors: string[]) {
    const validateCoord = (coord: number[]) => {
      const [lng, lat] = coord;
      if (lng < -180 || lng > 180) {
        errors.push(`Longitude ${lng} is outside valid range (-180 to 180)`);
      }
      if (lat < -90 || lat > 90) {
        errors.push(`Latitude ${lat} is outside valid range (-90 to 90)`);
      }
      // Indonesia specific range check
      if (lng < 95 || lng > 141) {
        errors.push(`Longitude ${lng} is outside Indonesia range (95°E to 141°E)`);
      }
      if (lat > 6 || lat < -11) {
        errors.push(`Latitude ${lat} is outside Indonesia range (6°N to 11°S)`);
      }
    };

    const processCoordinates = (coords: any) => {
      if (Array.isArray(coords[0])) {
        coords.forEach(processCoordinates);
      } else {
        validateCoord(coords);
      }
    };

    processCoordinates(coordinates);
  }
}

/**
 * Seismic Survey Validators
 */
export class SeismicSurveyValidator {
  static validateMandatoryFields(data: any): ValidationResult {
    const errors: string[] = [];

    const mandatoryFields = [
      { field: 'seisAcqtnSurveyId', label: 'SEIS_ACQTN_SURVEY_ID' },
      { field: 'acqtnSurveyName', label: 'ACQTN_SURVEY_NAME' },
      { field: 'wkId', label: 'WK_ID' },
      { field: 'seisDimension', label: 'SEIS_DIMENSION' },
      { field: 'environment', label: 'ENVIRONMENT' },
      { field: 'shotBy', label: 'SHOT_BY' },
      { field: 'shape', label: 'SHAPE (Geometry)' }
    ];

    mandatoryFields.forEach(({ field, label }) => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${label} is required and cannot be empty`);
      }
    });

    // Seismic ID format validation
    if (data.seisAcqtnSurveyId && !/^[A-Z0-9_-]+$/.test(data.seisAcqtnSurveyId)) {
      errors.push('SEIS_ACQTN_SURVEY_ID must contain only uppercase letters, numbers, underscores, and hyphens');
    }

    // Dimension validation
    if (data.seisDimension && !['2D', '3D'].includes(data.seisDimension)) {
      errors.push('SEIS_DIMENSION must be either "2D" or "3D"');
    }

    // Environment validation
    const validEnvironments = ['ONSHORE', 'OFFSHORE', 'TRANSITION_ZONE'];
    if (data.environment && !validEnvironments.includes(data.environment)) {
      errors.push(`ENVIRONMENT must be one of: ${validEnvironments.join(', ')}`);
    }

    // Date validation
    if (data.startDate && data.completedDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.completedDate);
      if (end < start) {
        errors.push('Completed date cannot be earlier than start date');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static async validateForeignKeys(data: any, prisma: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate WK_ID exists
    if (data.wkId) {
      const workingArea = await prisma.workingArea.findUnique({
        where: { wkId: data.wkId }
      });

      if (!workingArea) {
        errors.push(`Working Area with WK_ID "${data.wkId}" does not exist`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

/**
 * Well Validators
 */
export class WellValidator {
  static validateMandatoryFields(data: any): ValidationResult {
    const errors: string[] = [];

    const mandatoryFields = [
      { field: 'uwi', label: 'UWI (Unique Well Identifier)' },
      { field: 'wellName', label: 'WELL_NAME' },
      { field: 'wkId', label: 'WK_ID' },
      { field: 'currentClass', label: 'CURRENT_CLASS' },
      { field: 'statusType', label: 'STATUS_TYPE' },
      { field: 'environmentType', label: 'ENVIRONMENT_TYPE' },
      { field: 'surfaceLongitude', label: 'SURFACE_LONGITUDE' },
      { field: 'surfaceLatitude', label: 'SURFACE_LATITUDE' },
      { field: 'operator', label: 'OPERATOR' },
      { field: 'shape', label: 'SHAPE (Geometry)' }
    ];

    mandatoryFields.forEach(({ field, label }) => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${label} is required and cannot be empty`);
      }
    });

    // UWI format validation (typically AAAAA-BBBBB-CC format)
    if (data.uwi && !/^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{2}$/.test(data.uwi)) {
      errors.push('UWI must follow format AAAAA-BBBBB-CC (e.g., 12345-67890-AB)');
    }

    // Coordinate validation
    if (data.surfaceLongitude) {
      const lng = parseFloat(data.surfaceLongitude);
      if (lng < 95 || lng > 141) {
        errors.push('Surface Longitude must be within Indonesia range (95°E to 141°E)');
      }
    }

    if (data.surfaceLatitude) {
      const lat = parseFloat(data.surfaceLatitude);
      if (lat > 6 || lat < -11) {
        errors.push('Surface Latitude must be within Indonesia range (6°N to 11°S)');
      }
    }

    // Total depth validation
    if (data.totalDepth && (isNaN(data.totalDepth) || data.totalDepth <= 0)) {
      errors.push('Total Depth must be a positive number');
    }

    // Date validation
    if (data.spudDate && data.finalDrillDate) {
      const spud = new Date(data.spudDate);
      const final = new Date(data.finalDrillDate);
      if (final < spud) {
        errors.push('Final Drill Date cannot be earlier than Spud Date');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static async validateForeignKeys(data: any, prisma: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate WK_ID exists
    if (data.wkId) {
      const workingArea = await prisma.workingArea.findUnique({
        where: { wkId: data.wkId }
      });

      if (!workingArea) {
        errors.push(`Working Area with WK_ID "${data.wkId}" does not exist`);
      }
    }

    // Validate FIELD_ID exists (if provided)
    if (data.fieldId) {
      const field = await prisma.field.findUnique({
        where: { fieldId: data.fieldId }
      });

      if (!field) {
        errors.push(`Field with FIELD_ID "${data.fieldId}" does not exist`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

/**
 * Field Validators
 */
export class FieldValidator {
  static validateMandatoryFields(data: any): ValidationResult {
    const errors: string[] = [];

    const mandatoryFields = [
      { field: 'fieldId', label: 'FIELD_ID' },
      { field: 'fieldName', label: 'FIELD_NAME' },
      { field: 'wkId', label: 'WK_ID' },
      { field: 'fieldType', label: 'FIELD_TYPE' },
      { field: 'basin', label: 'BASIN' },
      { field: 'operator', label: 'OPERATOR' },
      { field: 'status', label: 'STATUS' },
      { field: 'shape', label: 'SHAPE (Geometry)' }
    ];

    mandatoryFields.forEach(({ field, label }) => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${label} is required and cannot be empty`);
      }
    });

    // Field ID format validation
    if (data.fieldId && !/^[A-Z0-9_-]+$/.test(data.fieldId)) {
      errors.push('FIELD_ID must contain only uppercase letters, numbers, underscores, and hyphens');
    }

    // Field type validation
    const validFieldTypes = ['OIL', 'GAS', 'OIL_GAS', 'CONDENSATE'];
    if (data.fieldType && !validFieldTypes.includes(data.fieldType)) {
      errors.push(`FIELD_TYPE must be one of: ${validFieldTypes.join(', ')}`);
    }

    // Status validation
    const validStatuses = ['DISCOVERY', 'APPRAISAL', 'DEVELOPMENT', 'PRODUCTION', 'ABANDONED'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`STATUS must be one of: ${validStatuses.join(', ')}`);
    }

    // Numeric validations
    if (data.oilReserves && (isNaN(data.oilReserves) || data.oilReserves < 0)) {
      errors.push('Oil Reserves must be a non-negative number');
    }

    if (data.gasReserves && (isNaN(data.gasReserves) || data.gasReserves < 0)) {
      errors.push('Gas Reserves must be a non-negative number');
    }

    return { isValid: errors.length === 0, errors };
  }

  static async validateForeignKeys(data: any, prisma: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate WK_ID exists
    if (data.wkId) {
      const workingArea = await prisma.workingArea.findUnique({
        where: { wkId: data.wkId }
      });

      if (!workingArea) {
        errors.push(`Working Area with WK_ID "${data.wkId}" does not exist`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

/**
 * Facility Validators
 */
export class FacilityValidator {
  static validateMandatoryFields(data: any): ValidationResult {
    const errors: string[] = [];

    const mandatoryFields = [
      { field: 'facilityId', label: 'FACILITY_ID' },
      { field: 'facilityName', label: 'FACILITY_NAME' },
      { field: 'facilityType', label: 'FACILITY_TYPE' },
      { field: 'wkId', label: 'WK_ID' },
      { field: 'operator', label: 'OPERATOR' },
      { field: 'status', label: 'STATUS' },
      { field: 'shape', label: 'SHAPE (Geometry)' }
    ];

    mandatoryFields.forEach(({ field, label }) => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${label} is required and cannot be empty`);
      }
    });

    // Facility ID format validation
    if (data.facilityId && !/^[A-Z0-9_-]+$/.test(data.facilityId)) {
      errors.push('FACILITY_ID must contain only uppercase letters, numbers, underscores, and hyphens');
    }

    // Facility type validation
    const validFacilityTypes = [
      'PIPELINE', 'PLATFORM', 'FLOATING_FACILITY', 'PROCESSING_PLANT',
      'INJECTION_FACILITY', 'COMPRESSION_STATION', 'PUMPING_STATION',
      'METERING_STATION', 'TERMINAL', 'STORAGE_TANK'
    ];
    if (data.facilityType && !validFacilityTypes.includes(data.facilityType)) {
      errors.push(`FACILITY_TYPE must be one of: ${validFacilityTypes.join(', ')}`);
    }

    // Status validation
    const validStatuses = ['PLANNED', 'UNDER_CONSTRUCTION', 'OPERATIONAL', 'SUSPENDED', 'ABANDONED', 'DECOMMISSIONED'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`STATUS must be one of: ${validStatuses.join(', ')}`);
    }

    // Type-specific validations
    if (data.facilityType === 'PIPELINE') {
      if (data.diameter && (isNaN(data.diameter) || data.diameter <= 0)) {
        errors.push('Pipeline diameter must be a positive number');
      }
      if (data.length && (isNaN(data.length) || data.length <= 0)) {
        errors.push('Pipeline length must be a positive number');
      }
    }

    if (data.facilityType === 'PLATFORM') {
      if (data.waterDepth && (isNaN(data.waterDepth) || data.waterDepth < 0)) {
        errors.push('Water depth must be a non-negative number');
      }
      if (data.noOfWell && (isNaN(data.noOfWell) || data.noOfWell < 0)) {
        errors.push('Number of wells must be a non-negative integer');
      }
    }

    // Date validation
    if (data.installationDate && data.commissioningDate) {
      const installation = new Date(data.installationDate);
      const commissioning = new Date(data.commissioningDate);
      if (commissioning < installation) {
        errors.push('Commissioning date cannot be earlier than installation date');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static async validateForeignKeys(data: any, prisma: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate WK_ID exists
    if (data.wkId) {
      const workingArea = await prisma.workingArea.findUnique({
        where: { wkId: data.wkId }
      });

      if (!workingArea) {
        errors.push(`Working Area with WK_ID "${data.wkId}" does not exist`);
      }
    }

    // Validate FIELD_ID exists (if provided)
    if (data.fieldId) {
      const field = await prisma.field.findUnique({
        where: { fieldId: data.fieldId }
      });

      if (!field) {
        errors.push(`Field with FIELD_ID "${data.fieldId}" does not exist`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

/**
 * Comprehensive validator that combines all domain validators
 */
export class MdmValidator {
  static async validateData(
    domain: 'workingArea' | 'seismicSurvey' | 'well' | 'field' | 'facility',
    data: any,
    context: ValidationContext,
    prisma?: any
  ): Promise<ValidationResult> {
    let mandatoryResult: ValidationResult;
    let foreignKeyResult: ValidationResult = { isValid: true, errors: [] };

    switch (domain) {
      case 'workingArea':
        mandatoryResult = WorkingAreaValidator.validateMandatoryFields(data);
        if (data.shape) {
          const geometryResult = WorkingAreaValidator.validateGeometry(data.shape);
          mandatoryResult.errors.push(...geometryResult.errors);
          mandatoryResult.isValid = mandatoryResult.isValid && geometryResult.isValid;
        }
        break;

      case 'seismicSurvey':
        mandatoryResult = SeismicSurveyValidator.validateMandatoryFields(data);
        if (prisma) {
          foreignKeyResult = await SeismicSurveyValidator.validateForeignKeys(data, prisma);
        }
        break;

      case 'well':
        mandatoryResult = WellValidator.validateMandatoryFields(data);
        if (prisma) {
          foreignKeyResult = await WellValidator.validateForeignKeys(data, prisma);
        }
        break;

      case 'field':
        mandatoryResult = FieldValidator.validateMandatoryFields(data);
        if (prisma) {
          foreignKeyResult = await FieldValidator.validateForeignKeys(data, prisma);
        }
        break;

      case 'facility':
        mandatoryResult = FacilityValidator.validateMandatoryFields(data);
        if (prisma) {
          foreignKeyResult = await FacilityValidator.validateForeignKeys(data, prisma);
        }
        break;

      default:
        throw new Error(`Unsupported domain: ${domain}`);
    }

    return {
      isValid: mandatoryResult.isValid && foreignKeyResult.isValid,
      errors: [...mandatoryResult.errors, ...foreignKeyResult.errors],
      warnings: mandatoryResult.warnings
    };
  }
}