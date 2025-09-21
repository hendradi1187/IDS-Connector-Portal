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
