
export type User = {
  id: string; // userId from Firebase Auth UID
  email: string;
  name: string;
  role: 'KKKS-Provider' | 'SKK-Consumer' | 'Admin';
  organization: string;
  createdAt: string;
  avatar: string; // Keep avatar for UI
};

export type DataRequest = {
  id: string; // requestId
  resourceName: string;
  contractName: string;
  requesterId: string; // userId SKK Migas
  providerId: string; // userId KKKS
  resourceId: string;
  requestType: 'GeoJSON' | 'Seismic' | 'Production';
  status: 'Tertunda' | 'Disetujui' | 'Terkirim' | 'Ditolak';
  purpose: string;
  createdAt: string;
  updatedAt: string;
  destination: string;
  created: string;
};

export type Resource = {
  id: string; // resourceId
  providerId?: string; // Optional for backward compatibility
  name: string;
  description: string;
  type: 'Peta GeoJSON' | 'Data Sumur (Well Log)' | 'Data Produksi' | 'Lainnya';
  storagePath?: string; // link Firebase Storage
  metadata?: {
    lokasi: { latitude: number; longitude: number };
    luas_area: number;
    periode: string;
  };
  accessPolicy?: 'restricted' | 'public' | 'contract-only';
  createdAt?: string;
  updatedAt?: string;
  created: string;
  status: 'Tersedia' | 'Tidak Digunakan';
};

export type Route = {
  id: string; // routeId
  providerId?: string;
  consumerId?: string;
  resourceId?: string;
  status: 'Active' | 'Inactive';
  validUntil?: string; // timestamp
  created: string;
  name: string;
  endpoint: string;
};

export type Broker = {
  id: string; // brokerId
  transactionId?: string;
  requestId?: string;
  validationStatus?: 'pending' | 'approved' | 'rejected';
  notes?: string;
  timestamp?: string;
  name: string;
  url: string;
  status: 'Registered' | 'Unregistered';
  created: string;
};

export type NetworkSetting = {
  id: string; // settingId
  providerId: string;
  apiEndpoint: string;
  protocol: 'HTTPS' | 'VPN' | 'IDS Broker';
  status: 'active' | 'inactive';
  lastChecked: string; // timestamp
};

export type Container = {
  id: string; // containerId
  serviceName: 'GeoJSON Parser' | 'Request Handler';
  providerId: string;
  status: 'running' | 'stopped' | 'error';
  lastRestarted: string; // timestamp
  logs: string[];
};

export type ActivityLog = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: 'CREATE_ROUTE' | 'UPDATE_RESOURCE' | 'CONNECTOR_RESTART' | 'DELETE_CONTRACT' | 'LOGIN' | 'upload_resource' | 'request_data' | 'approve_request';
  details: string | Record<string, any>;
  status: 'Success' | 'Failed' | 'In Progress';
  timestamp: string;
};


// The following types are kept for existing component compatibility but should be deprecated/removed.
// They are based on the old data structure.

export type Connector = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
};

export type ChartData = {
  time: string;
  requests: number;
  responses: number;
};

export type Module = {
  id: string;
  name: string;
  description: string;
  items: number;
  collectionName?: string;
};

export type ExternalService = {
  id: string;
  name: string;
  status: 'Online' | 'Offline' | 'Degraded';
  url: string;
};

export type Contract = {
  id: string;
  name: string;
  provider: string;
  created: string;
  status: 'Aktif' | 'Kadaluarsa';
};

export type Config = {
  id: string;
  key: string;
  value: string;
  description: string;
  created: string;
};

export type ServiceApplication = {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'Active' | 'Inactive';
  created: string;
};

export type ApiStatus = {
  id: string;
  name: string;
  status: 'Online' | 'Offline' | 'Degraded';
  latency: number;
};

export type ProcessingLog = {
  id: string;
  timestamp: string;
  service: string;
  message: string;
  level: 'Info' | 'Warning' | 'Error';
};

// Routing Services Types
export type DataRoute = {
  id: string;
  providerId: string;
  consumerId: string;
  resourceId: string;
  status: 'active' | 'inactive';
  validUntil?: string | null;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    organization: string;
  };
  consumer: {
    id: string;
    name: string;
    organization: string;
  };
  resource: {
    id: string;
    name: string;
    type: string;
    description: string;
  };
};

export type DistributionLog = {
  id: string;
  routeId: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
  dataSize: string;
  consumer: string;
  errorMessage?: string;
};

export type RoutingService = {
  id: string;
  name: string;
  description?: string;
  routingType: 'ROUND_ROBIN' | 'WEIGHTED' | 'FAILOVER' | 'RANDOM';
  priority: number;
  loadBalancing: 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'IP_HASH' | 'WEIGHTED_ROUND_ROBIN';
  healthCheck?: string;
  status: 'active' | 'inactive' | 'error';
  configuration?: any;
  createdAt: string;
  updatedAt: string;
  endpoints?: RoutingEndpoint[];
};

export type RoutingEndpoint = {
  id: string;
  routingServiceId: string;
  url: string;
  weight: number;
  status: 'active' | 'inactive' | 'unhealthy';
  responseTime?: number;
  lastCheck?: string;
  createdAt: string;
};

// Dataspace Connector Types
export type DataspaceConnector = {
  id: string;
  name: string;
  connectorUrl: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  securityProfile: {
    encryption?: string;
    authentication?: string;
    [key: string]: any;
  };
  supportedFormats: string[];
  capabilities: {
    protocols?: string[];
    maxFileSize?: string;
    [key: string]: any;
  };
  registeredAt: string;
  lastHealthCheck?: string;
  metadata: Record<string, any>;
};

// Vocabulary and Ontology Types
export type Vocabulary = {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'Active' | 'Draft' | 'Deprecated';
  namespace: string; // URI namespace for concepts
  concepts: number; // Count of concepts
  createdAt: string;
  updatedAt: string;
};

export type Concept = {
  id: string;
  vocabularyId: string;
  code: string; // Unique identifier within vocabulary
  label: string;
  definition: string;
  notation?: string; // Optional short notation/abbreviation
  broader?: string[]; // Parent concept IDs
  narrower?: string[]; // Child concept IDs
  related?: string[]; // Related concept IDs
  status: 'Active' | 'Draft' | 'Deprecated';
  createdAt: string;
  updatedAt: string;
};

export type OntologyRelationType =
  | 'broader' // Hierarchical - parent concept
  | 'narrower' // Hierarchical - child concept
  | 'related' // Semantic - related concept
  | 'exactMatch' // Semantic - exact same meaning
  | 'closeMatch' // Semantic - similar meaning
  | 'mappedTo' // Mapping - vocabulary to MDM field
  | 'references' // Foreign key - data relationship
  | 'partOf'; // Composition - part-whole relationship

export type OntologyRelation = {
  id: string;
  sourceType: 'concept' | 'mdm' | 'resource' | 'field';
  sourceId: string;
  sourceName: string;
  targetType: 'concept' | 'mdm' | 'resource' | 'field';
  targetId: string;
  targetName: string;
  relationType: OntologyRelationType;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
};

export type ConceptMapping = {
  id: string;
  conceptId: string;
  conceptLabel: string;
  vocabularyId: string;
  vocabularyName: string;
  // MDM mapping
  mdmDomain?: 'working-area' | 'seismic' | 'well' | 'field' | 'facility';
  mdmField?: string; // e.g., 'statusWk', 'jenisKontrak'
  mdmValue?: string; // The actual value in MDM
  // Resource mapping
  resourceType?: string;
  resourceField?: string;
  // Mapping metadata
  mappingType: 'exact' | 'close' | 'broad' | 'narrow';
  status: 'Active' | 'Draft' | 'Deprecated';
  createdAt: string;
  updatedAt: string;
};

export type OntologyStats = {
  totalVocabularies: number;
  totalConcepts: number;
  totalRelations: number;
  totalMappings: number;
  recentlyUpdated: number;
  integrationCoverage: {
    mdm: number; // Percentage of MDM fields mapped
    resources: number; // Percentage of resource types mapped
    vocabulary: number; // Percentage of concepts with mappings
  };
};

// Schema Validation & Format Enforcement Types
export type DataFormat =
  | 'ISO_8601' // Date/time format
  | 'WGS_84' // Geographic coordinates
  | 'EPSG_4326' // Coordinate system
  | 'GeoJSON' // Geographic data format
  | 'UUID' // Unique identifier
  | 'EMAIL' // Email format
  | 'URL' // Web URL
  | 'REGEX' // Custom regex pattern
  | 'ENUM'; // Enumerated values

export type ValidationRule = {
  id: string;
  name: string;
  description: string;
  ruleType: 'format' | 'range' | 'required' | 'unique' | 'reference' | 'custom';
  format?: DataFormat;
  pattern?: string; // Regex pattern
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  allowedValues?: string[]; // For ENUM
  isMandatory: boolean;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
};

export type SchemaDefinition = {
  id: string;
  name: string;
  description: string;
  domain: 'vocabulary' | 'mdm' | 'resource' | 'concept';
  version: string;
  fields: SchemaField[];
  validationRules: string[]; // ValidationRule IDs
  status: 'Draft' | 'Active' | 'Deprecated';
  standardCompliance: StandardReference[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type SchemaField = {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'geometry';
  format?: DataFormat;
  required: boolean;
  unique?: boolean;
  defaultValue?: any;
  description: string;
  validationRules: string[]; // ValidationRule IDs
  examples?: string[];
};

export type StandardReference = {
  name: string; // e.g., "OGC API - Features", "Satu Data Indonesia"
  version: string;
  url?: string;
  compliance: 'full' | 'partial' | 'none';
};

// Data Lineage Types
export type DataLineage = {
  id: string;
  entityType: 'vocabulary' | 'concept' | 'mapping' | 'relation';
  entityId: string;
  entityName: string;
  operation: 'create' | 'update' | 'delete' | 'import' | 'export' | 'transform' | 'validate';
  timestamp: string;
  userId: string;
  userName: string;
  source?: {
    type: 'manual' | 'import' | 'api' | 'sync';
    reference?: string; // Import file, API endpoint, etc.
  };
  target?: {
    type: 'firestore' | 'export' | 'api';
    reference?: string;
  };
  transformations?: TransformationStep[];
  metadata?: Record<string, any>;
  previousVersion?: string; // Reference to previous version
};

export type TransformationStep = {
  step: number;
  action: string;
  input: any;
  output: any;
  timestamp: string;
};

// Versioning & History Types
export type VersionHistory = {
  id: string;
  entityType: 'vocabulary' | 'concept' | 'mapping' | 'schema';
  entityId: string;
  version: string; // Semantic versioning: major.minor.patch
  versionNumber: number; // Sequential version number
  changes: ChangeRecord[];
  changeType: 'major' | 'minor' | 'patch';
  changeSummary: string;
  previousVersionId?: string;
  snapshot: any; // Full snapshot of entity at this version
  createdAt: string;
  createdBy: string;
  createdByName: string;
  status: 'Draft' | 'Published' | 'Deprecated';
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedAt?: string;
};

export type ChangeRecord = {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'add' | 'modify' | 'delete';
  timestamp: string;
};

// Workflow Approval Types
export type WorkflowRequest = {
  id: string;
  requestType: 'create' | 'update' | 'delete' | 'publish' | 'deprecate';
  entityType: 'vocabulary' | 'concept' | 'mapping' | 'relation' | 'schema';
  entityId?: string; // null for create
  entityName: string;
  requestedChanges: any; // The proposed changes
  currentVersion?: any; // Current state (for update/delete)
  newVersion?: any; // Proposed state (for create/update)
  status: 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string; // Justification for the change
  impactAnalysis?: string; // Analysis of impact
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  reviewers: WorkflowReviewer[];
  comments: WorkflowComment[];
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
};

export type WorkflowReviewer = {
  userId: string;
  userName: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Abstained';
  reviewedAt?: string;
  comments?: string;
};

export type WorkflowComment = {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
  type: 'comment' | 'question' | 'suggestion' | 'concern';
};

// Standards Integration Types
export type OGCFeature = {
  id: string;
  type: 'Feature';
  geometry?: any; // GeoJSON geometry
  properties: Record<string, any>;
  links?: OGCLink[];
};

export type OGCLink = {
  href: string;
  rel: string;
  type?: string;
  title?: string;
};

export type SatuDataMetadata = {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  tags: string[];
  organisasi: {
    nama: string;
    kode: string;
  };
  kontak: {
    nama: string;
    email: string;
  };
  lisensi: string;
  tanggalDibuat: string;
  tanggalDiubah: string;
  frekuensiPembaruan: 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan' | 'Tidak Pasti';
  format: string[];
  koordinatGeografis?: {
    batasUtara: number;
    batasSelatan: number;
    batasTimur: number;
    batasBarat: number;
  };
  urlAkses: string;
  statusData: 'Aktif' | 'Tidak Aktif';
};
