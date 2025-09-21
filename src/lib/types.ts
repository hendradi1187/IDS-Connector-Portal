
export type User = {
  id: string; // userId from Firebase Auth UID
  email: string;
  role: 'KKKS-Provider' | 'SKK-Consumer' | 'Admin';
  organization: string;
  createdAt: string;
  avatar: string; // Keep avatar for UI
};

export type DataRequest = {
  id: string; // requestId
  requesterId: string; // userId SKK Migas
  providerId: string; // userId KKKS
  resourceId: string;
  requestType: 'GeoJSON' | 'Seismic' | 'Production';
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  purpose: string;
  createdAt: string;
  updatedAt: string;
};

export type Resource = {
  id: string; // resourceId
  providerId: string;
  name: string;
  description: string;
  type: 'GeoJSON' | 'CSV' | 'Well Data';
  storagePath: string; // link Firebase Storage
  metadata: {
    lokasi: { latitude: number; longitude: number };
    luas_area: number;
    periode: string;
  };
  accessPolicy: 'restricted' | 'public' | 'contract-only';
  createdAt: string;
  updatedAt: string;
};

export type Route = {
  id: string; // routeId
  providerId: string;
  consumerId: string;
  resourceId: string;
  status: 'active' | 'inactive';
  validUntil: string; // timestamp
  createdAt: string;
};

export type Broker = {
  id: string; // brokerId
  transactionId: string;
  requestId: string;
  validationStatus: 'pending' | 'approved' | 'rejected';
  notes: string;
  timestamp: string;
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
  id: string; // logId implicit
  action: 'upload_resource' | 'request_data' | 'approve_request';
  userId: string;
  details: Record<string, any>;
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
