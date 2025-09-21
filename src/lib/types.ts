export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operator' | 'Viewer';
  avatar: string;
};

export type ActivityLog = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  details: string;
  status: 'Success' | 'Failed' | 'In Progress';
  timestamp: string;
};

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

export type Resource = {
  id: string;
  name: string;
  type: string;
  created: string;
  status: 'Available' | 'Deprecated';
};

export type Contract = {
  id: string;
  name: string;
  provider: string;
  created: string;
  status: 'Active' | 'Expired';
};

export type Route = {
  id: string;
  name: string;
  endpoint: string;
  created: string;
  status: 'Active' | 'Inactive';
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

export type Broker = {
  id: string;
  name: string;
  url: string;
  status: 'Registered' | 'Unregistered';
  created: string;
};
