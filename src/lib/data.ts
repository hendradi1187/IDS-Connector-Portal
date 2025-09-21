import { User, ActivityLog, ChartData, Connector, Module, ExternalService, Resource } from '@/lib/types';

export const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', avatar: '/avatars/01.png' },
  { id: '2', name: 'Operator One', email: 'operator1@example.com', role: 'Operator', avatar: '/avatars/02.png' },
  { id: '3', name: 'Viewer Two', email: 'viewer2@example.com', role: 'Viewer', avatar: '/avatars/03.png' },
  { id: '4', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'Operator', avatar: '/avatars/04.png' },
  { id: '5', name: 'Bob Williams', email: 'bob.w@example.com', role: 'Viewer', avatar: '/avatars/05.png' },
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log1',
    user: { name: 'Admin User', avatar: '/avatars/01.png' },
    action: 'CREATE_ROUTE',
    details: 'New route "supply-chain-data" created',
    status: 'Success',
    timestamp: '2 minutes ago',
  },
  {
    id: 'log2',
    user: { name: 'Operator One', avatar: '/avatars/02.png' },
    action: 'UPDATE_RESOURCE',
    details: 'Resource "sensor-data-v2" updated',
    status: 'Success',
    timestamp: '15 minutes ago',
  },
  {
    id: 'log3',
    user: { name: 'System', avatar: '/avatars/system.png' },
    action: 'CONNECTOR_RESTART',
    details: 'Connector "Main-DE-Hub" restarted due to error',
    status: 'Failed',
    timestamp: '1 hour ago',
  },
  {
    id: 'log4',
    user: { name: 'Alice Johnson', avatar: '/avatars/04.png' },
    action: 'DELETE_CONTRACT',
    details: 'Contract "old-agreement-q1" deleted',
    status: 'Success',
    timestamp: '3 hours ago',
  },
  {
    id: 'log5',
    user: { name: 'Viewer Two', avatar: '/avatars/03.png' },
    action: 'LOGIN',
    details: 'User logged in successfully',
    status: 'In Progress',
    timestamp: '1 day ago',
  },
];

export const mockChartData: ChartData[] = [
  { time: '12:00', requests: 58, responses: 55 },
  { time: '13:00', requests: 72, responses: 68 },
  { time: '14:00', requests: 95, responses: 90 },
  { time: '15:00', requests: 88, responses: 85 },
  { time: '16:00', requests: 110, responses: 105 },
  { time: '17:00', requests: 124, responses: 118 },
  { time: '18:00', requests: 98, responses: 95 },
];

export const mockConnectors: Connector[] = [
  { name: 'Route Handler', status: 'active' },
  { name: 'REST Controller', status: 'active' },
  { name: 'Database Handler', status: 'active' },
  { name: 'Configuration Manager', status: 'inactive' },
];

export const mockModules: Module[] = [
    {id: '1', name: 'Resource Handling', description: 'Manage data resources and offerings.', items: 125},
    {id: '2', name: 'Usage Control', description: 'Define and enforce data usage policies.', items: 42},
    {id: '3', name: 'Message Handling', description: 'Process and route IDS messages.', items: 89},
    {id: '4', name: 'Identity Management', description: 'Manage connector and user identities.', items: 2},
];

export const mockServices: ExternalService[] = [
    {id: '1', name: 'Identity Provider', status: 'Online', url: 'idp.example.com'},
    {id: '2', name: 'DAPS', status: 'Online', url: 'daps.example.com'},
    {id: '3', name: 'Clearing House', status: 'Degraded', url: 'clearing.example.com'},
    {id: '4', name: 'IDS Broker', status: 'Online', url: 'broker.example.com'},
    {id: '5', name: 'App Store', status: 'Offline', url: 'store.example.com'},
];

export const mockResources: Resource[] = [
    {id: 'res-001', name: 'Sensor Data Stream v1.2', type: 'Data Stream', created: '2023-10-26', status: 'Available'},
    {id: 'res-002', name: 'Logistics Report Q3', type: 'PDF Document', created: '2023-09-15', status: 'Available'},
    {id: 'res-003', name: 'Legacy Machine API', type: 'API Endpoint', created: '2022-01-20', status: 'Deprecated'},
    {id: 'res-004', name: 'Customer Dataset (EU)', type: 'Database Table', created: '2023-11-01', status: 'Available'},
];
