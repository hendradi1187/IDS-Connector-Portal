'use server';

export interface ApprovalSubmission {
  id: string;
  datasetId: string;
  datasetName: string;
  submittedBy: string;
  submitterName: string;
  submitterEmail: string;
  submissionType: 'new' | 'update' | 'delete';
  description: string;
  changes?: Record<string, any>;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ApprovalHistory {
  id: string;
  datasetId: string;
  submissionId: string;
  action: 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'commented';
  performedBy: string;
  performerName: string;
  notes?: string;
  timestamp: Date;
}

// Mock data storage
let approvalSubmissionsStore: ApprovalSubmission[] = [
  {
    id: '1',
    datasetId: '3',
    datasetName: 'Sales Transactions',
    submittedBy: 'user1',
    submitterName: 'John Doe',
    submitterEmail: 'john@example.com',
    submissionType: 'new',
    description: 'New sales transaction dataset for Q1 2024',
    status: 'pending',
    submittedAt: new Date('2024-03-05'),
    priority: 'high'
  },
  {
    id: '2',
    datasetId: '4',
    datasetName: 'Employee Records',
    submittedBy: 'user2',
    submitterName: 'Jane Smith',
    submitterEmail: 'jane@example.com',
    submissionType: 'update',
    description: 'Updated schema to include department information',
    changes: {
      schema: {
        added: ['department', 'manager_id'],
        removed: []
      }
    },
    status: 'under_review',
    submittedAt: new Date('2024-03-01'),
    reviewedBy: 'admin1',
    reviewerName: 'Admin User',
    priority: 'medium'
  },
  {
    id: '3',
    datasetId: '5',
    datasetName: 'Legacy System Data',
    submittedBy: 'user3',
    submitterName: 'Bob Johnson',
    submitterEmail: 'bob@example.com',
    submissionType: 'delete',
    description: 'Remove deprecated legacy dataset',
    status: 'approved',
    submittedAt: new Date('2024-02-20'),
    reviewedBy: 'admin1',
    reviewerName: 'Admin User',
    reviewedAt: new Date('2024-02-21'),
    reviewNotes: 'Approved for deletion as data has been migrated',
    priority: 'low'
  }
];

let approvalHistoryStore: ApprovalHistory[] = [
  {
    id: '1',
    datasetId: '3',
    submissionId: '1',
    action: 'submitted',
    performedBy: 'user1',
    performerName: 'John Doe',
    notes: 'Initial submission for approval',
    timestamp: new Date('2024-03-05')
  },
  {
    id: '2',
    datasetId: '4',
    submissionId: '2',
    action: 'submitted',
    performedBy: 'user2',
    performerName: 'Jane Smith',
    notes: 'Submitted for review',
    timestamp: new Date('2024-03-01')
  },
  {
    id: '3',
    datasetId: '4',
    submissionId: '2',
    action: 'reviewed',
    performedBy: 'admin1',
    performerName: 'Admin User',
    notes: 'Under review - checking schema compatibility',
    timestamp: new Date('2024-03-02')
  },
  {
    id: '4',
    datasetId: '5',
    submissionId: '3',
    action: 'submitted',
    performedBy: 'user3',
    performerName: 'Bob Johnson',
    notes: 'Request to delete legacy data',
    timestamp: new Date('2024-02-20')
  },
  {
    id: '5',
    datasetId: '5',
    submissionId: '3',
    action: 'approved',
    performedBy: 'admin1',
    performerName: 'Admin User',
    notes: 'Approved for deletion as data has been migrated',
    timestamp: new Date('2024-02-21')
  }
];

/**
 * Submit dataset for approval
 */
export async function submitForApproval(
  datasetId: string,
  datasetName: string,
  userId: string,
  userName: string,
  userEmail: string,
  submissionType: 'new' | 'update' | 'delete',
  description: string,
  changes?: Record<string, any>,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): Promise<ApprovalSubmission> {
  const newSubmission: ApprovalSubmission = {
    id: Date.now().toString(),
    datasetId,
    datasetName,
    submittedBy: userId,
    submitterName: userName,
    submitterEmail: userEmail,
    submissionType,
    description,
    changes,
    status: 'pending',
    submittedAt: new Date(),
    priority
  };

  approvalSubmissionsStore.push(newSubmission);

  // Add to history
  const historyEntry: ApprovalHistory = {
    id: Date.now().toString() + '-h',
    datasetId,
    submissionId: newSubmission.id,
    action: 'submitted',
    performedBy: userId,
    performerName: userName,
    notes: description,
    timestamp: new Date()
  };
  approvalHistoryStore.push(historyEntry);

  return newSubmission;
}

/**
 * List pending approvals
 */
export async function listPendingApprovals(): Promise<ApprovalSubmission[]> {
  return approvalSubmissionsStore
    .filter(s => s.status === 'pending' || s.status === 'under_review')
    .sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.submittedAt.getTime() - a.submittedAt.getTime();
    });
}

/**
 * List all submissions (with optional status filter)
 */
export async function listApprovalSubmissions(
  status?: 'pending' | 'under_review' | 'approved' | 'rejected'
): Promise<ApprovalSubmission[]> {
  if (status) {
    return approvalSubmissionsStore.filter(s => s.status === status);
  }
  return [...approvalSubmissionsStore].sort(
    (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
  );
}

/**
 * Approve dataset submission
 */
export async function approveDataset(
  submissionId: string,
  approverId: string,
  approverName: string,
  notes?: string
): Promise<boolean> {
  const submission = approvalSubmissionsStore.find(s => s.id === submissionId);

  if (!submission || !['pending', 'under_review'].includes(submission.status)) {
    return false;
  }

  submission.status = 'approved';
  submission.reviewedBy = approverId;
  submission.reviewerName = approverName;
  submission.reviewedAt = new Date();
  submission.reviewNotes = notes;

  // Add to history
  const historyEntry: ApprovalHistory = {
    id: Date.now().toString(),
    datasetId: submission.datasetId,
    submissionId,
    action: 'approved',
    performedBy: approverId,
    performerName: approverName,
    notes,
    timestamp: new Date()
  };
  approvalHistoryStore.push(historyEntry);

  return true;
}

/**
 * Reject dataset submission
 */
export async function rejectDataset(
  submissionId: string,
  approverId: string,
  approverName: string,
  reason: string
): Promise<boolean> {
  const submission = approvalSubmissionsStore.find(s => s.id === submissionId);

  if (!submission || !['pending', 'under_review'].includes(submission.status)) {
    return false;
  }

  submission.status = 'rejected';
  submission.reviewedBy = approverId;
  submission.reviewerName = approverName;
  submission.reviewedAt = new Date();
  submission.reviewNotes = reason;

  // Add to history
  const historyEntry: ApprovalHistory = {
    id: Date.now().toString(),
    datasetId: submission.datasetId,
    submissionId,
    action: 'rejected',
    performedBy: approverId,
    performerName: approverName,
    notes: reason,
    timestamp: new Date()
  };
  approvalHistoryStore.push(historyEntry);

  return true;
}

/**
 * Set submission status to under review
 */
export async function markUnderReview(
  submissionId: string,
  reviewerId: string,
  reviewerName: string,
  notes?: string
): Promise<boolean> {
  const submission = approvalSubmissionsStore.find(s => s.id === submissionId);

  if (!submission || submission.status !== 'pending') {
    return false;
  }

  submission.status = 'under_review';
  submission.reviewedBy = reviewerId;
  submission.reviewerName = reviewerName;

  // Add to history
  const historyEntry: ApprovalHistory = {
    id: Date.now().toString(),
    datasetId: submission.datasetId,
    submissionId,
    action: 'reviewed',
    performedBy: reviewerId,
    performerName: reviewerName,
    notes,
    timestamp: new Date()
  };
  approvalHistoryStore.push(historyEntry);

  return true;
}

/**
 * Get approval history for a dataset
 */
export async function getApprovalHistory(datasetId: string): Promise<ApprovalHistory[]> {
  return approvalHistoryStore
    .filter(h => h.datasetId === datasetId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(submissionId: string): Promise<ApprovalSubmission | null> {
  return approvalSubmissionsStore.find(s => s.id === submissionId) || null;
}

/**
 * Add comment to submission
 */
export async function addSubmissionComment(
  submissionId: string,
  userId: string,
  userName: string,
  comment: string
): Promise<boolean> {
  const submission = approvalSubmissionsStore.find(s => s.id === submissionId);

  if (!submission) {
    return false;
  }

  // Add to history
  const historyEntry: ApprovalHistory = {
    id: Date.now().toString(),
    datasetId: submission.datasetId,
    submissionId,
    action: 'commented',
    performedBy: userId,
    performerName: userName,
    notes: comment,
    timestamp: new Date()
  };
  approvalHistoryStore.push(historyEntry);

  return true;
}
