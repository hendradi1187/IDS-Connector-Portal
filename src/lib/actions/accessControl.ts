'use server';

export type AccessRole = 'Viewer' | 'Editor' | 'Admin';

export interface DatasetAccess {
  id: string;
  datasetId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: AccessRole;
  grantedBy: string;
  grantedAt: Date;
}

export interface AccessRequest {
  id: string;
  datasetId: string;
  datasetName: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestedRole: AccessRole;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

// Mock data storage
let accessStore: DatasetAccess[] = [
  {
    id: '1',
    datasetId: '1',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    role: 'Admin',
    grantedBy: 'system',
    grantedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    datasetId: '1',
    userId: 'user2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    role: 'Editor',
    grantedBy: 'user1',
    grantedAt: new Date('2024-02-01')
  },
  {
    id: '3',
    datasetId: '1',
    userId: 'user3',
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    role: 'Viewer',
    grantedBy: 'user1',
    grantedAt: new Date('2024-02-15')
  },
  {
    id: '4',
    datasetId: '2',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    role: 'Admin',
    grantedBy: 'system',
    grantedAt: new Date('2024-02-10')
  }
];

let accessRequestsStore: AccessRequest[] = [
  {
    id: '1',
    datasetId: '2',
    datasetName: 'Product Inventory',
    userId: 'user4',
    userName: 'Alice Williams',
    userEmail: 'alice@example.com',
    requestedRole: 'Editor',
    reason: 'Need to update product information',
    status: 'pending',
    requestedAt: new Date('2024-03-01')
  },
  {
    id: '2',
    datasetId: '3',
    datasetName: 'Sales Transactions',
    userId: 'user5',
    userName: 'Charlie Brown',
    userEmail: 'charlie@example.com',
    requestedRole: 'Viewer',
    reason: 'Required for sales analysis project',
    status: 'pending',
    requestedAt: new Date('2024-03-05')
  }
];

/**
 * Assign role to a user for a dataset
 */
export async function assignRole(
  datasetId: string,
  userId: string,
  userName: string,
  userEmail: string,
  role: AccessRole,
  grantedBy: string
): Promise<DatasetAccess> {
  // Check if user already has access
  const existingAccess = accessStore.find(
    a => a.datasetId === datasetId && a.userId === userId
  );

  if (existingAccess) {
    // Update existing role
    existingAccess.role = role;
    existingAccess.grantedBy = grantedBy;
    existingAccess.grantedAt = new Date();
    return existingAccess;
  }

  // Create new access
  const newAccess: DatasetAccess = {
    id: Date.now().toString(),
    datasetId,
    userId,
    userName,
    userEmail,
    role,
    grantedBy,
    grantedAt: new Date()
  };

  accessStore.push(newAccess);
  return newAccess;
}

/**
 * Revoke user access to a dataset
 */
export async function revokeRole(datasetId: string, userId: string): Promise<boolean> {
  const index = accessStore.findIndex(
    a => a.datasetId === datasetId && a.userId === userId
  );

  if (index === -1) {
    return false;
  }

  accessStore.splice(index, 1);
  return true;
}

/**
 * List all users with access to a dataset
 */
export async function listAccess(datasetId: string): Promise<DatasetAccess[]> {
  return accessStore.filter(a => a.datasetId === datasetId);
}

/**
 * Check if user has permission for a specific action
 */
export async function checkPermission(
  datasetId: string,
  userId: string,
  action: 'view' | 'edit' | 'delete' | 'manage'
): Promise<boolean> {
  const access = accessStore.find(
    a => a.datasetId === datasetId && a.userId === userId
  );

  if (!access) {
    return false;
  }

  switch (action) {
    case 'view':
      return ['Viewer', 'Editor', 'Admin'].includes(access.role);
    case 'edit':
      return ['Editor', 'Admin'].includes(access.role);
    case 'delete':
    case 'manage':
      return access.role === 'Admin';
    default:
      return false;
  }
}

/**
 * Request access to a dataset
 */
export async function requestAccess(
  datasetId: string,
  datasetName: string,
  userId: string,
  userName: string,
  userEmail: string,
  requestedRole: AccessRole,
  reason: string
): Promise<AccessRequest> {
  const newRequest: AccessRequest = {
    id: Date.now().toString(),
    datasetId,
    datasetName,
    userId,
    userName,
    userEmail,
    requestedRole,
    reason,
    status: 'pending',
    requestedAt: new Date()
  };

  accessRequestsStore.push(newRequest);
  return newRequest;
}

/**
 * Approve access request
 */
export async function approveAccess(requestId: string, reviewerId: string): Promise<boolean> {
  const request = accessRequestsStore.find(r => r.id === requestId);

  if (!request || request.status !== 'pending') {
    return false;
  }

  request.status = 'approved';
  request.reviewedBy = reviewerId;
  request.reviewedAt = new Date();

  // Grant the access
  await assignRole(
    request.datasetId,
    request.userId,
    request.userName,
    request.userEmail,
    request.requestedRole,
    reviewerId
  );

  return true;
}

/**
 * Reject access request
 */
export async function rejectAccess(
  requestId: string,
  reviewerId: string,
  reason: string
): Promise<boolean> {
  const request = accessRequestsStore.find(r => r.id === requestId);

  if (!request || request.status !== 'pending') {
    return false;
  }

  request.status = 'rejected';
  request.reviewedBy = reviewerId;
  request.reviewedAt = new Date();
  request.reviewNotes = reason;

  return true;
}

/**
 * List all access requests (optionally filtered by status)
 */
export async function listAccessRequests(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<AccessRequest[]> {
  if (status) {
    return accessRequestsStore.filter(r => r.status === status);
  }
  return [...accessRequestsStore];
}

/**
 * Get access requests for a specific dataset
 */
export async function getDatasetAccessRequests(datasetId: string): Promise<AccessRequest[]> {
  return accessRequestsStore.filter(r => r.datasetId === datasetId);
}
