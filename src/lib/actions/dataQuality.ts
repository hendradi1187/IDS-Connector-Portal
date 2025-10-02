'use server';

export interface QualityRule {
  id: string;
  datasetId: string;
  name: string;
  description: string;
  type: 'completeness' | 'consistency' | 'accuracy' | 'validity' | 'uniqueness';
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export interface QualityIssue {
  id: string;
  datasetId: string;
  ruleId: string;
  ruleName: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  field?: string;
  rowCount?: number;
  detectedAt: Date;
  status: 'open' | 'resolved' | 'ignored';
}

export interface QualityReport {
  datasetId: string;
  datasetName: string;
  overallScore: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  validity: number;
  uniqueness: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  lastChecked: Date;
}

// Mock data storage
let qualityRulesStore: QualityRule[] = [
  {
    id: '1',
    datasetId: '1',
    name: 'No Null Primary Keys',
    description: 'Customer ID must not be null',
    type: 'completeness',
    condition: 'customer_id IS NOT NULL',
    severity: 'critical',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    datasetId: '1',
    name: 'Valid Email Format',
    description: 'Email must be in valid format',
    type: 'validity',
    condition: 'email MATCHES EMAIL_PATTERN',
    severity: 'high',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    datasetId: '2',
    name: 'Non-negative Stock',
    description: 'Stock levels cannot be negative',
    type: 'accuracy',
    condition: 'stock >= 0',
    severity: 'high',
    createdAt: new Date('2024-02-10')
  }
];

let qualityIssuesStore: QualityIssue[] = [
  {
    id: '1',
    datasetId: '1',
    ruleId: '2',
    ruleName: 'Valid Email Format',
    description: '15 records have invalid email format',
    severity: 'high',
    field: 'email',
    rowCount: 15,
    detectedAt: new Date('2024-03-01'),
    status: 'open'
  },
  {
    id: '2',
    datasetId: '2',
    ruleId: '3',
    ruleName: 'Non-negative Stock',
    description: '3 products have negative stock values',
    severity: 'high',
    field: 'stock',
    rowCount: 3,
    detectedAt: new Date('2024-03-05'),
    status: 'open'
  }
];

/**
 * Run quality check on a dataset
 */
export async function runQualityCheck(datasetId: string): Promise<QualityReport> {
  // Simulate quality check execution
  const rules = qualityRulesStore.filter(r => r.datasetId === datasetId);
  const issues = qualityIssuesStore.filter(i => i.datasetId === datasetId && i.status === 'open');

  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;
  const lowIssues = issues.filter(i => i.severity === 'low').length;

  // Calculate overall score (100 - deductions for issues)
  const overallScore = Math.max(0, 100 - (criticalIssues * 20) - (highIssues * 10) - (mediumIssues * 5) - (lowIssues * 2));

  return {
    datasetId,
    datasetName: 'Dataset Name',
    overallScore,
    completeness: 95,
    consistency: 98,
    accuracy: 92,
    validity: 88,
    uniqueness: 100,
    totalIssues: issues.length,
    criticalIssues,
    highIssues,
    mediumIssues,
    lowIssues,
    lastChecked: new Date()
  };
}

/**
 * Get quality report for a dataset
 */
export async function getQualityReport(datasetId: string): Promise<QualityReport> {
  return runQualityCheck(datasetId);
}

/**
 * List quality issues for a dataset
 */
export async function listQualityIssues(datasetId: string): Promise<QualityIssue[]> {
  return qualityIssuesStore.filter(i => i.datasetId === datasetId);
}

/**
 * Add a new quality rule
 */
export async function addQualityRule(rule: Omit<QualityRule, 'id' | 'createdAt'>): Promise<QualityRule> {
  const newRule: QualityRule = {
    id: Date.now().toString(),
    ...rule,
    createdAt: new Date()
  };

  qualityRulesStore.push(newRule);
  return newRule;
}

/**
 * Delete a quality rule
 */
export async function deleteQualityRule(ruleId: string): Promise<boolean> {
  const index = qualityRulesStore.findIndex(r => r.id === ruleId);

  if (index === -1) {
    return false;
  }

  qualityRulesStore.splice(index, 1);
  return true;
}

/**
 * Get all quality rules for a dataset
 */
export async function listQualityRules(datasetId: string): Promise<QualityRule[]> {
  return qualityRulesStore.filter(r => r.datasetId === datasetId);
}

/**
 * Update quality issue status
 */
export async function updateQualityIssueStatus(issueId: string, status: 'open' | 'resolved' | 'ignored'): Promise<boolean> {
  const issue = qualityIssuesStore.find(i => i.id === issueId);

  if (!issue) {
    return false;
  }

  issue.status = status;
  return true;
}
