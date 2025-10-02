'use server';

// ============================================================================
// METADATA MANAGEMENT FOR OIL & GAS (MIGAS) SECTOR
// Compliant with PPDM, SNI Migas, and Satu Data Indonesia standards
// ============================================================================

export type DatasetType =
  | 'Well Log'
  | 'Production Data'
  | 'Facility Data'
  | 'Seismic 2D'
  | 'Seismic 3D'
  | 'Geological Data'
  | 'Reservoir Data'
  | 'Drilling Data'
  | 'Completion Data'
  | 'HSE Data';

export type FileFormat =
  | 'SEG-Y'
  | 'LAS'
  | 'CSV'
  | 'Excel'
  | 'Shapefile'
  | 'GeoTIFF'
  | 'PDF'
  | 'JSON'
  | 'XML';

export type CoordinateSystem =
  | 'WGS84'
  | 'UTM Zone 47N'
  | 'UTM Zone 48N'
  | 'UTM Zone 49N'
  | 'UTM Zone 50N'
  | 'UTM Zone 51N';

export type ValidationStandard =
  | 'PPDM'
  | 'Master Data Management'
  | 'Satu Data Indonesia'
  | 'IDS';

export interface MigasMetadata {
  id: string;

  // Basic Information
  datasetName: string;
  description: string;
  datasetType: DatasetType;
  fileFormat: FileFormat;

  // Location & Area
  workingArea: string;           // Wilayah Kerja
  fieldId?: string;              // Field ID
  blockId?: string;              // Block ID
  coordinates?: {
    latitude: number;
    longitude: number;
    coordinateSystem: CoordinateSystem;
  };

  // Temporal Information
  acquisitionDate: Date;         // Tanggal akuisisi
  periodStart?: Date;            // Periode mulai
  periodEnd?: Date;              // Periode akhir

  // Ownership & Source
  kkksOwner: string;             // KKKS pemilik data
  kkksId: string;                // ID KKKS
  sourceSystem: string;          // Sistem sumber (SCADA, DMS, etc)

  // Schema & Validation
  schema: Record<string, any>;   // Data schema/structure
  validationStandards: ValidationStandard[];
  validationStatus: 'pending' | 'valid' | 'invalid';
  validationErrors?: string[];

  // Lineage & Versioning
  version: number;
  previousVersionId?: string;
  lineage: DataLineage[];

  // Workflow & Approval
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt?: Date;
  submittedBy?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;

  // Metadata
  tags: string[];
  category: string;
  confidentialityLevel: 'Public' | 'Internal' | 'Confidential' | 'Restricted';

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface DataLineage {
  timestamp: Date;
  action: 'created' | 'updated' | 'validated' | 'approved' | 'versioned';
  performedBy: string;
  description: string;
  sourceSystem?: string;
  changes?: Record<string, any>;
}

export interface SchemaValidationResult {
  isValid: boolean;
  standard: ValidationStandard;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  checkedAt: Date;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface ValidationWarning {
  field: string;
  message: string;
}

// Mock data storage
let migasMetadataStore: MigasMetadata[] = [
  {
    id: '1',
    datasetName: 'Seismic Survey 2D Blok Mahakam 2024',
    description: 'Seismic 2D survey untuk eksplorasi area baru di Blok Mahakam',
    datasetType: 'Seismic 2D',
    fileFormat: 'SEG-Y',
    workingArea: 'Blok Mahakam',
    fieldId: 'MHK-001',
    blockId: 'BLK-MHKM-2024',
    coordinates: {
      latitude: -0.5,
      longitude: 117.5,
      coordinateSystem: 'WGS84'
    },
    acquisitionDate: new Date('2024-01-15'),
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
    kkksOwner: 'PT Pertamina Hulu Energi',
    kkksId: 'KKKS-001',
    sourceSystem: 'Seismic Data Management System',
    schema: {
      fields: [
        { name: 'TRACE_ID', type: 'integer', required: true },
        { name: 'CDP_X', type: 'float', required: true },
        { name: 'CDP_Y', type: 'float', required: true },
        { name: 'INLINE', type: 'integer', required: true },
        { name: 'CROSSLINE', type: 'integer', required: true }
      ]
    },
    validationStandards: ['PPDM', 'Master Data Management'],
    validationStatus: 'valid',
    version: 1,
    lineage: [
      {
        timestamp: new Date('2024-01-15'),
        action: 'created',
        performedBy: 'john.doe@phe.co.id',
        description: 'Initial metadata registration',
        sourceSystem: 'Seismic DMS'
      }
    ],
    status: 'approved',
    submittedAt: new Date('2024-01-16'),
    submittedBy: 'john.doe@phe.co.id',
    reviewedAt: new Date('2024-01-17'),
    reviewedBy: 'reviewer@skkmigas.go.id',
    reviewNotes: 'Approved - all validations passed',
    tags: ['seismic', '2d', 'mahakam', 'exploration'],
    category: 'Seismic Data',
    confidentialityLevel: 'Confidential',
    createdAt: new Date('2024-01-15'),
    createdBy: 'john.doe@phe.co.id',
    updatedAt: new Date('2024-01-17'),
    updatedBy: 'reviewer@skkmigas.go.id'
  },
  {
    id: '2',
    datasetName: 'Production Data Sumur XYZ-001 Q1 2024',
    description: 'Data produksi harian sumur XYZ-001 untuk kuartal pertama 2024',
    datasetType: 'Production Data',
    fileFormat: 'CSV',
    workingArea: 'Blok Rokan',
    fieldId: 'RKN-002',
    blockId: 'BLK-ROKN-2024',
    coordinates: {
      latitude: 1.2,
      longitude: 101.3,
      coordinateSystem: 'UTM Zone 47N'
    },
    acquisitionDate: new Date('2024-03-31'),
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-03-31'),
    kkksOwner: 'PT Rokan Energi',
    kkksId: 'KKKS-002',
    sourceSystem: 'SCADA Production System',
    schema: {
      fields: [
        { name: 'WELL_ID', type: 'string', required: true, unique: true },
        { name: 'DATE', type: 'date', required: true, format: 'YYYY-MM-DD' },
        { name: 'OIL_RATE', type: 'float', required: true, unit: 'BBLS' },
        { name: 'GAS_RATE', type: 'float', required: true, unit: 'MSCFD' },
        { name: 'WATER_RATE', type: 'float', required: true, unit: 'BBLS' },
        { name: 'CHOKE_SIZE', type: 'float', unit: 'inch' }
      ]
    },
    validationStandards: ['PPDM', 'Master Data Management', 'Satu Data Indonesia'],
    validationStatus: 'valid',
    version: 2,
    previousVersionId: '2-v1',
    lineage: [
      {
        timestamp: new Date('2024-04-01'),
        action: 'created',
        performedBy: 'operator@rokan.co.id',
        description: 'Initial metadata registration',
        sourceSystem: 'SCADA'
      },
      {
        timestamp: new Date('2024-04-02'),
        action: 'validated',
        performedBy: 'system',
        description: 'PPDM and Master Data Management validation passed'
      },
      {
        timestamp: new Date('2024-04-05'),
        action: 'versioned',
        performedBy: 'operator@rokan.co.id',
        description: 'Updated schema to include CHOKE_SIZE field',
        changes: {
          schema: {
            added: ['CHOKE_SIZE']
          }
        }
      }
    ],
    status: 'submitted',
    submittedAt: new Date('2024-04-05'),
    submittedBy: 'operator@rokan.co.id',
    tags: ['production', 'well', 'rokan', 'oil', 'gas'],
    category: 'Production Data',
    confidentialityLevel: 'Confidential',
    createdAt: new Date('2024-04-01'),
    createdBy: 'operator@rokan.co.id',
    updatedAt: new Date('2024-04-05'),
    updatedBy: 'operator@rokan.co.id'
  }
];

/**
 * Validate metadata schema against PPDM, Master Data Management, and Satu Data Indonesia standards
 */
export async function validateMetadataSchema(
  metadata: Partial<MigasMetadata>
): Promise<SchemaValidationResult[]> {
  const results: SchemaValidationResult[] = [];

  // PPDM Validation
  const ppdmResult = await validatePPDM(metadata);
  results.push(ppdmResult);

  // Master Data Management Validation
  const mdmResult = await validateMDM(metadata);
  results.push(mdmResult);

  // Satu Data Indonesia Validation
  const satuDataResult = await validateSatuDataIndonesia(metadata);
  results.push(satuDataResult);

  return results;
}

async function validatePPDM(metadata: Partial<MigasMetadata>): Promise<SchemaValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check Well_ID format (for Production Data)
  if (metadata.datasetType === 'Production Data') {
    const schema = metadata.schema;
    const wellIdField = schema?.fields?.find((f: any) => f.name === 'WELL_ID');

    if (!wellIdField) {
      errors.push({
        field: 'schema.WELL_ID',
        rule: 'PPDM-WL-001',
        message: 'WELL_ID field is mandatory for Production Data (PPDM 3.9)',
        severity: 'critical'
      });
    } else if (!wellIdField.unique) {
      errors.push({
        field: 'schema.WELL_ID',
        rule: 'PPDM-WL-002',
        message: 'WELL_ID must be unique identifier',
        severity: 'high'
      });
    }

    // Check if Field_ID exists
    if (!metadata.fieldId) {
      errors.push({
        field: 'fieldId',
        rule: 'PPDM-FL-001',
        message: 'FIELD_ID is mandatory and must link to valid field',
        severity: 'critical'
      });
    }
  }

  // Check coordinates for spatial data
  if (['Seismic 2D', 'Seismic 3D', 'Geological Data'].includes(metadata.datasetType || '')) {
    if (!metadata.coordinates) {
      errors.push({
        field: 'coordinates',
        rule: 'PPDM-SP-001',
        message: 'Spatial coordinates are required for seismic/geological data',
        severity: 'critical'
      });
    } else if (!['WGS84', 'UTM Zone 47N', 'UTM Zone 48N', 'UTM Zone 49N', 'UTM Zone 50N', 'UTM Zone 51N'].includes(metadata.coordinates.coordinateSystem)) {
      warnings.push({
        field: 'coordinates.coordinateSystem',
        message: 'Coordinate system should be WGS84 or UTM for Indonesia'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    standard: 'PPDM',
    errors,
    warnings,
    checkedAt: new Date()
  };
}

async function validateMDM(metadata: Partial<MigasMetadata>): Promise<SchemaValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // MDM Hulu Migas - SKK Migas Data Specification v2
  // Based on actual database schema at prisma/schema.prisma line 1620

  const schema = metadata.schema;

  // 1. Working Area (WK_ID) Validation
  if (metadata.workingArea) {
    // WK_ID should be unique and follow format
    if (metadata.fieldId && !metadata.fieldId.match(/^WK-[A-Z0-9]+$/)) {
      warnings.push({
        field: 'workingArea',
        message: 'WK_ID should follow format: WK-XXXX (as per MDM Hulu Migas spec)'
      });
    }
  }

  // 2. Well Data Validation (if type is Well Log)
  if (metadata.datasetType === 'Well Log') {
    const uwiField = schema?.fields?.find((f: any) => f.name === 'UWI' || f.name === 'uwi');

    if (!uwiField) {
      errors.push({
        field: 'schema.UWI',
        rule: 'MDM-WELL-001',
        message: 'UWI (Unique Well Identifier) is mandatory for Well data (MDM Hulu Migas standard)',
        severity: 'critical'
      });
    }

    // Check for mandatory well fields
    const mandatoryWellFields = ['WELL_NAME', 'OPERATOR', 'SURFACE_LONGITUDE', 'SURFACE_LATITUDE'];
    mandatoryWellFields.forEach(fieldName => {
      if (!schema?.fields?.find((f: any) => f.name.toUpperCase() === fieldName)) {
        errors.push({
          field: `schema.${fieldName}`,
          rule: 'MDM-WELL-002',
          message: `${fieldName} is mandatory for Well data (MDM Hulu Migas)`,
          severity: 'high'
        });
      }
    });
  }

  // 3. Seismic Survey Validation
  if (metadata.datasetType === 'Seismic 2D' || metadata.datasetType === 'Seismic 3D') {
    const surveyIdField = schema?.fields?.find((f: any) =>
      f.name === 'SEIS_ACQTN_SURVEY_ID' || f.name === 'seis_acqtn_survey_id'
    );

    if (!surveyIdField) {
      errors.push({
        field: 'schema.SEIS_ACQTN_SURVEY_ID',
        rule: 'MDM-SEIS-001',
        message: 'SEIS_ACQTN_SURVEY_ID is mandatory for Seismic data (MDM Hulu Migas)',
        severity: 'critical'
      });
    }

    // Validate dimension
    const dimensionField = schema?.fields?.find((f: any) => f.name === 'SEIS_DIMENSION');
    if (dimensionField) {
      const validDimensions = ['2D', '3D'];
      if (dimensionField.value && !validDimensions.includes(dimensionField.value)) {
        errors.push({
          field: 'schema.SEIS_DIMENSION',
          rule: 'MDM-SEIS-002',
          message: 'SEIS_DIMENSION must be either 2D or 3D (MDM Hulu Migas)',
          severity: 'high'
        });
      }
    }
  }

  // 4. Field Data Validation
  if (metadata.datasetType === 'Production Data' || metadata.datasetType === 'Reservoir Data') {
    if (metadata.fieldId && !metadata.fieldId.match(/^FIELD-[A-Z0-9]+$/)) {
      warnings.push({
        field: 'fieldId',
        message: 'FIELD_ID should follow format: FIELD-XXXX (MDM Hulu Migas convention)'
      });
    }

    // Check for field type
    const fieldTypeField = schema?.fields?.find((f: any) => f.name === 'FIELD_TYPE');
    if (fieldTypeField) {
      const validFieldTypes = ['Oil', 'Gas', 'Oil-Gas', 'Non-Production'];
      if (fieldTypeField.value && !validFieldTypes.includes(fieldTypeField.value)) {
        errors.push({
          field: 'schema.FIELD_TYPE',
          rule: 'MDM-FIELD-001',
          message: 'FIELD_TYPE must be: Oil, Gas, Oil-Gas, or Non-Production (MDM Hulu Migas)',
          severity: 'high'
        });
      }
    }
  }

  // 5. Coordinate System Validation (CRS/EPSG)
  if (metadata.coordinates) {
    const crsEpsg = metadata.coordinates.coordinateSystem;

    // WGS 84 should be EPSG:4326
    if (crsEpsg === 'WGS84') {
      // Valid - this is the default for MDM Hulu Migas
    } else if (crsEpsg.startsWith('UTM')) {
      // Valid - UTM zones are acceptable
    } else {
      warnings.push({
        field: 'coordinates.coordinateSystem',
        message: 'MDM Hulu Migas standard recommends WGS 84 (EPSG:4326) or UTM zones'
      });
    }
  }

  // 6. Geometry/Shape Validation
  const shapeField = schema?.fields?.find((f: any) => f.name === 'SHAPE' || f.name === 'shape');
  if (shapeField && metadata.datasetType !== 'Production Data') {
    // Geometry is important for spatial data
    if (!shapeField.type || !['polygon', 'point', 'polyline', 'multipoint'].includes(shapeField.type.toLowerCase())) {
      warnings.push({
        field: 'schema.SHAPE',
        message: 'SHAPE should be valid geometry type: point, polyline, polygon, or multipoint (MDM Hulu Migas)'
      });
    }
  }

  // 7. Date Format Validation (ISO 8601 / YYYY-MM-DD)
  const dateFields = schema?.fields?.filter((f: any) => f.type === 'date') || [];
  dateFields.forEach((field: any) => {
    if (field.format && field.format !== 'YYYY-MM-DD' && field.format !== 'ISO8601') {
      errors.push({
        field: `schema.${field.name}`,
        rule: 'MDM-DT-001',
        message: `Date field ${field.name} must use YYYY-MM-DD or ISO8601 format (MDM Hulu Migas)`,
        severity: 'high'
      });
    }
  });

  // 8. Operator/KKKS Validation
  const operatorField = schema?.fields?.find((f: any) =>
    f.name === 'OPERATOR' || f.name === 'operator' || f.name === 'BA_LONG_NAME'
  );
  if (!operatorField && metadata.kkksOwner) {
    warnings.push({
      field: 'schema.OPERATOR',
      message: 'OPERATOR field recommended for traceability (MDM Hulu Migas best practice)'
    });
  }

  // 9. Status Field Validation
  const statusField = schema?.fields?.find((f: any) =>
    f.name === 'STATUS' || f.name === 'STATUS_TYPE'
  );
  if (statusField && statusField.value) {
    // Different valid statuses per data type
    const validStatuses: Record<string, string[]> = {
      'Well Log': ['Active', 'Suspended', 'Abandoned', 'Plugged'],
      'Production Data': ['Active', 'Shut-in', 'Abandoned'],
      'Facility Data': ['Operating', 'Standby', 'Decommissioned']
    };

    const allowedStatuses = validStatuses[metadata.datasetType || ''];
    if (allowedStatuses && !allowedStatuses.includes(statusField.value)) {
      warnings.push({
        field: 'schema.STATUS',
        message: `STATUS should be one of: ${allowedStatuses.join(', ')} for ${metadata.datasetType} (MDM Hulu Migas)`
      });
    }
  }

  return {
    isValid: errors.length === 0,
    standard: 'Master Data Management',
    errors,
    warnings,
    checkedAt: new Date()
  };
}

async function validateSatuDataIndonesia(metadata: Partial<MigasMetadata>): Promise<SchemaValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check metadata completeness
  if (!metadata.datasetName || metadata.datasetName.length < 10) {
    errors.push({
      field: 'datasetName',
      rule: 'SDI-MD-001',
      message: 'Dataset name must be descriptive (min 10 characters)',
      severity: 'medium'
    });
  }

  if (!metadata.description || metadata.description.length < 20) {
    errors.push({
      field: 'description',
      rule: 'SDI-MD-002',
      message: 'Description must be comprehensive (min 20 characters)',
      severity: 'medium'
    });
  }

  // Check tags
  if (!metadata.tags || metadata.tags.length < 3) {
    warnings.push({
      field: 'tags',
      message: 'Recommended to have at least 3 tags for better discoverability'
    });
  }

  // Check temporal coverage
  if (metadata.periodStart && metadata.periodEnd) {
    if (metadata.periodEnd < metadata.periodStart) {
      errors.push({
        field: 'periodEnd',
        rule: 'SDI-TM-001',
        message: 'Period end date cannot be before start date',
        severity: 'critical'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    standard: 'Satu Data Indonesia',
    errors,
    warnings,
    checkedAt: new Date()
  };
}

/**
 * Create new migas metadata with automatic validation
 */
export async function createMigasMetadata(
  input: Omit<MigasMetadata, 'id' | 'version' | 'lineage' | 'createdAt' | 'updatedAt' | 'validationStatus'>
): Promise<{ metadata: MigasMetadata; validation: SchemaValidationResult[] }> {

  // Run validation
  const validationResults = await validateMetadataSchema(input);
  const hasErrors = validationResults.some(r => !r.isValid);

  const newMetadata: MigasMetadata = {
    id: Date.now().toString(),
    ...input,
    version: 1,
    lineage: [
      {
        timestamp: new Date(),
        action: 'created',
        performedBy: input.createdBy,
        description: 'Initial metadata registration',
        sourceSystem: input.sourceSystem
      }
    ],
    validationStatus: hasErrors ? 'invalid' : 'valid',
    validationErrors: hasErrors ? validationResults.flatMap(r => r.errors.map(e => e.message)) : undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  migasMetadataStore.push(newMetadata);

  return {
    metadata: newMetadata,
    validation: validationResults
  };
}

/**
 * Update metadata and create new version
 */
export async function updateMigasMetadata(
  id: string,
  updates: Partial<MigasMetadata>,
  updatedBy: string
): Promise<{ metadata: MigasMetadata; validation: SchemaValidationResult[] } | null> {

  const index = migasMetadataStore.findIndex(m => m.id === id);
  if (index === -1) return null;

  const current = migasMetadataStore[index];

  // Create new version
  const newVersion = current.version + 1;
  const previousVersionId = `${id}-v${current.version}`;

  // Merge updates
  const updated = {
    ...current,
    ...updates,
    version: newVersion,
    previousVersionId,
    updatedAt: new Date(),
    updatedBy
  };

  // Run validation
  const validationResults = await validateMetadataSchema(updated);
  const hasErrors = validationResults.some(r => !r.isValid);

  updated.validationStatus = hasErrors ? 'invalid' : 'valid';
  updated.validationErrors = hasErrors ? validationResults.flatMap(r => r.errors.map(e => e.message)) : undefined;

  // Add lineage entry
  updated.lineage.push({
    timestamp: new Date(),
    action: 'versioned',
    performedBy: updatedBy,
    description: `Updated to version ${newVersion}`,
    changes: updates
  });

  migasMetadataStore[index] = updated;

  return {
    metadata: updated,
    validation: validationResults
  };
}

/**
 * Submit metadata for approval
 */
export async function submitForApproval(
  id: string,
  submittedBy: string
): Promise<MigasMetadata | null> {
  const index = migasMetadataStore.findIndex(m => m.id === id);
  if (index === -1) return null;

  const metadata = migasMetadataStore[index];

  // Can only submit if draft or rejected
  if (!['draft', 'rejected'].includes(metadata.status)) {
    throw new Error(`Cannot submit metadata with status: ${metadata.status}`);
  }

  // Must pass validation first
  if (metadata.validationStatus !== 'valid') {
    throw new Error('Metadata must pass validation before submission');
  }

  metadata.status = 'submitted';
  metadata.submittedAt = new Date();
  metadata.submittedBy = submittedBy;

  metadata.lineage.push({
    timestamp: new Date(),
    action: 'updated',
    performedBy: submittedBy,
    description: 'Submitted for approval'
  });

  return metadata;
}

/**
 * Approve metadata (SKK Migas reviewer)
 */
export async function approveMetadata(
  id: string,
  reviewedBy: string,
  reviewNotes?: string
): Promise<MigasMetadata | null> {
  const index = migasMetadataStore.findIndex(m => m.id === id);
  if (index === -1) return null;

  const metadata = migasMetadataStore[index];

  metadata.status = 'approved';
  metadata.reviewedAt = new Date();
  metadata.reviewedBy = reviewedBy;
  metadata.reviewNotes = reviewNotes;

  metadata.lineage.push({
    timestamp: new Date(),
    action: 'approved',
    performedBy: reviewedBy,
    description: reviewNotes || 'Metadata approved'
  });

  return metadata;
}

/**
 * Reject metadata (SKK Migas reviewer)
 */
export async function rejectMetadata(
  id: string,
  reviewedBy: string,
  reviewNotes: string
): Promise<MigasMetadata | null> {
  const index = migasMetadataStore.findIndex(m => m.id === id);
  if (index === -1) return null;

  const metadata = migasMetadataStore[index];

  metadata.status = 'rejected';
  metadata.reviewedAt = new Date();
  metadata.reviewedBy = reviewedBy;
  metadata.reviewNotes = reviewNotes;

  metadata.lineage.push({
    timestamp: new Date(),
    action: 'updated',
    performedBy: reviewedBy,
    description: `Metadata rejected: ${reviewNotes}`
  });

  return metadata;
}

/**
 * List all migas metadata
 */
export async function listMigasMetadata(
  filters?: {
    status?: MigasMetadata['status'];
    datasetType?: DatasetType;
    kkksId?: string;
    workingArea?: string;
  }
): Promise<MigasMetadata[]> {
  let result = [...migasMetadataStore];

  if (filters?.status) {
    result = result.filter(m => m.status === filters.status);
  }

  if (filters?.datasetType) {
    result = result.filter(m => m.datasetType === filters.datasetType);
  }

  if (filters?.kkksId) {
    result = result.filter(m => m.kkksId === filters.kkksId);
  }

  if (filters?.workingArea) {
    result = result.filter(m => m.workingArea === filters.workingArea);
  }

  return result;
}

/**
 * Get metadata by ID with lineage history
 */
export async function getMigasMetadataById(id: string): Promise<MigasMetadata | null> {
  return migasMetadataStore.find(m => m.id === id) || null;
}

/**
 * Get version history for a dataset
 */
export async function getVersionHistory(id: string): Promise<DataLineage[]> {
  const metadata = migasMetadataStore.find(m => m.id === id);
  return metadata?.lineage || [];
}
