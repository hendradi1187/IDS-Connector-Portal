import { z } from 'zod';

// SKK Migas Data Specification v2 Schema Validation
export const GeospatialCoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90).describe('Latitude in decimal degrees'),
  longitude: z.number().min(-180).max(180).describe('Longitude in decimal degrees'),
  elevation: z.number().optional().describe('Elevation in meters above sea level'),
  coordinateSystem: z.enum(['WGS84', 'EPSG:4326', 'UTM']).default('WGS84'),
});

export const WorkingAreaMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
  operator: z.string().min(1).max(255),
  contractArea: z.string().min(1).max(255),
  block: z.string().min(1).max(100),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number()))),
  }),
  bounds: z.object({
    northEast: GeospatialCoordinateSchema,
    southWest: GeospatialCoordinateSchema,
  }),
  area: z.number().positive().describe('Area in square kilometers'),
  waterDepth: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    unit: z.enum(['meters', 'feet']).default('meters'),
  }).optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended', 'Relinquished']),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime().optional(),
  metadata: z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    lastModified: z.string().datetime(),
    modifiedBy: z.string().uuid(),
    approvalStatus: z.enum(['Draft', 'Pending', 'Approved', 'Rejected']),
    dataClassification: z.enum(['Public', 'Internal', 'Confidential', 'Restricted']),
    retentionPeriod: z.number().positive().describe('Retention period in years'),
  }),
});

export const WellMetadataSchema = z.object({
  id: z.string().uuid(),
  wellName: z.string().min(1).max(255),
  wellNumber: z.string().min(1).max(100),
  operator: z.string().min(1).max(255),
  field: z.string().min(1).max(255),
  workingArea: z.string().uuid(),
  location: GeospatialCoordinateSchema,
  wellType: z.enum(['Exploration', 'Development', 'Injection', 'Observation']),
  status: z.enum(['Drilling', 'Completed', 'Producing', 'Abandoned', 'Suspended']),
  spudDate: z.string().datetime().optional(),
  completionDate: z.string().datetime().optional(),
  totalDepth: z.number().positive().describe('Total depth in meters'),
  formations: z.array(z.object({
    name: z.string(),
    topDepth: z.number(),
    bottomDepth: z.number(),
    lithology: z.string(),
  })),
  completion: z.object({
    type: z.enum(['Cased', 'Open-hole', 'Liner']),
    perforations: z.array(z.object({
      topDepth: z.number(),
      bottomDepth: z.number(),
      density: z.number().describe('Shots per foot'),
    })).optional(),
  }).optional(),
  metadata: z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    lastModified: z.string().datetime(),
    modifiedBy: z.string().uuid(),
    approvalStatus: z.enum(['Draft', 'Pending', 'Approved', 'Rejected']),
    dataQuality: z.enum(['High', 'Medium', 'Low']),
    confidentialityLevel: z.enum(['Public', 'Restricted', 'Confidential']),
  }),
});

export const SeismicSurveyMetadataSchema = z.object({
  id: z.string().uuid(),
  surveyName: z.string().min(1).max(255),
  surveyType: z.enum(['2D', '3D', '4D']),
  operator: z.string().min(1).max(255),
  contractor: z.string().min(1).max(255),
  workingArea: z.string().uuid(),
  acquisitionPeriod: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  coverage: z.object({
    geometry: z.object({
      type: z.enum(['Polygon', 'LineString']),
      coordinates: z.array(z.array(z.number())),
    }),
    area: z.number().positive().describe('Coverage area in square kilometers'),
    lineKilometers: z.number().positive().optional(),
  }),
  parameters: z.object({
    recordLength: z.number().positive(),
    sampleRate: z.number().positive(),
    sourceType: z.enum(['Airgun', 'Vibroseis', 'Dynamite']),
    receiverType: z.enum(['Hydrophone', 'Geophone']),
    fold: z.number().positive(),
  }),
  processing: z.object({
    contractor: z.string(),
    level: z.enum(['Raw', 'Processed', 'Interpreted']),
    migrationVelocity: z.string().optional(),
  }),
  metadata: z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    lastModified: z.string().datetime(),
    modifiedBy: z.string().uuid(),
    approvalStatus: z.enum(['Draft', 'Pending', 'Approved', 'Rejected']),
    dataVolume: z.string().describe('Data volume with unit (e.g., 500 GB)'),
    storageLocation: z.string().url().optional(),
  }),
});

export const FacilityMetadataSchema = z.object({
  id: z.string().uuid(),
  facilityName: z.string().min(1).max(255),
  facilityType: z.enum(['Platform', 'FPSO', 'Pipeline', 'Terminal', 'Processing Plant']),
  operator: z.string().min(1).max(255),
  workingArea: z.string().uuid(),
  location: GeospatialCoordinateSchema,
  capacity: z.object({
    oil: z.number().positive().optional().describe('Oil capacity in barrels per day'),
    gas: z.number().positive().optional().describe('Gas capacity in MMSCFD'),
    storage: z.number().positive().optional().describe('Storage capacity in barrels'),
  }),
  specifications: z.object({
    installationDate: z.string().datetime().optional(),
    design: z.string().max(500),
    safetyFeatures: z.array(z.string()),
    environmentalCompliance: z.boolean(),
  }),
  operational: z.object({
    status: z.enum(['Operating', 'Maintenance', 'Standby', 'Decommissioned']),
    startupDate: z.string().datetime().optional(),
    lastInspection: z.string().datetime().optional(),
  }),
  metadata: z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    lastModified: z.string().datetime(),
    modifiedBy: z.string().uuid(),
    approvalStatus: z.enum(['Draft', 'Pending', 'Approved', 'Rejected']),
    certifications: z.array(z.string()),
    regulatoryCompliance: z.boolean(),
  }),
});

export const FieldMetadataSchema = z.object({
  id: z.string().uuid(),
  fieldName: z.string().min(1).max(255),
  operator: z.string().min(1).max(255),
  workingArea: z.string().uuid(),
  discovery: z.object({
    discoveryDate: z.string().datetime(),
    discoveryWell: z.string(),
    reserves: z.object({
      oil: z.number().positive().optional().describe('Oil reserves in million barrels'),
      gas: z.number().positive().optional().describe('Gas reserves in BCF'),
      condensate: z.number().positive().optional(),
    }),
  }),
  development: z.object({
    status: z.enum(['Undeveloped', 'Under Development', 'Producing', 'Mature', 'Depleted']),
    firstProduction: z.string().datetime().optional(),
    peakProduction: z.object({
      date: z.string().datetime(),
      oil: z.number().positive().optional(),
      gas: z.number().positive().optional(),
    }).optional(),
  }),
  geology: z.object({
    reservoirType: z.enum(['Sandstone', 'Carbonate', 'Shale']),
    depth: z.object({
      min: z.number().positive(),
      max: z.number().positive(),
      unit: z.enum(['meters', 'feet']).default('meters'),
    }),
    structure: z.string().max(500),
  }),
  metadata: z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    lastModified: z.string().datetime(),
    modifiedBy: z.string().uuid(),
    approvalStatus: z.enum(['Draft', 'Pending', 'Approved', 'Rejected']),
    confidentialityLevel: z.enum(['Public', 'Restricted', 'Confidential']),
    economicValue: z.enum(['High', 'Medium', 'Low']).optional(),
  }),
});

// Unified Metadata Schema
export const MetadataSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('working-area'), data: WorkingAreaMetadataSchema }),
  z.object({ type: z.literal('well'), data: WellMetadataSchema }),
  z.object({ type: z.literal('seismic'), data: SeismicSurveyMetadataSchema }),
  z.object({ type: z.literal('facility'), data: FacilityMetadataSchema }),
  z.object({ type: z.literal('field'), data: FieldMetadataSchema }),
]);

// Validation utility functions
export function validateMetadata(type: string, data: unknown) {
  try {
    const schema = getSchemaByType(type);
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }
    throw error;
  }
}

export function getSchemaByType(type: string) {
  switch (type) {
    case 'working-area':
      return WorkingAreaMetadataSchema;
    case 'well':
      return WellMetadataSchema;
    case 'seismic':
      return SeismicSurveyMetadataSchema;
    case 'facility':
      return FacilityMetadataSchema;
    case 'field':
      return FieldMetadataSchema;
    default:
      throw new Error(`Unknown metadata type: ${type}`);
  }
}

// OGC API Features compliance
export const OGCCollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  links: z.array(z.object({
    href: z.string().url(),
    rel: z.string(),
    type: z.string().optional(),
    title: z.string().optional(),
  })),
  extent: z.object({
    spatial: z.object({
      bbox: z.array(z.array(z.number())),
      crs: z.string().default('http://www.opengis.net/def/crs/OGC/1.3/CRS84'),
    }),
    temporal: z.object({
      interval: z.array(z.array(z.string().datetime().nullable())),
      trs: z.string().default('http://www.opengis.net/def/uom/ISO-8601/0/Gregorian'),
    }),
  }),
  itemType: z.string().default('feature'),
  crs: z.array(z.string()),
});

export type WorkingAreaMetadata = z.infer<typeof WorkingAreaMetadataSchema>;
export type WellMetadata = z.infer<typeof WellMetadataSchema>;
export type SeismicSurveyMetadata = z.infer<typeof SeismicSurveyMetadataSchema>;
export type FacilityMetadata = z.infer<typeof FacilityMetadataSchema>;
export type FieldMetadata = z.infer<typeof FieldMetadataSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;