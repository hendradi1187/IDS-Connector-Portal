import { z } from 'zod';

// Policy Engine for Fine-grained Access Control
export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  type: 'allow' | 'deny';
  priority: number; // Higher number = higher priority
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  resources: ResourcePattern[];
  subjects: SubjectPattern[];
  effects: PolicyEffect[];
  timeRestrictions?: TimeRestriction;
  ipRestrictions?: string[]; // CIDR blocks
  contextRequirements?: ContextRequirement[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface PolicyCondition {
  type: 'attribute' | 'time' | 'location' | 'context' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'regex' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  attribute: string;
  value: any;
  caseSensitive?: boolean;
}

export interface PolicyAction {
  type: 'read' | 'write' | 'create' | 'update' | 'delete' | 'execute' | 'approve' | 'download' | 'export';
  parameters?: Record<string, any>;
}

export interface ResourcePattern {
  type: 'metadata' | 'contract' | 'vocabulary' | 'api' | 'file';
  pattern: string; // Glob-like pattern, e.g., "metadata:well:*", "api:/v1/seismic/*"
  attributes?: Record<string, any>;
}

export interface SubjectPattern {
  type: 'user' | 'role' | 'group' | 'organization' | 'api_key';
  pattern: string;
  attributes?: Record<string, any>;
}

export interface PolicyEffect {
  type: 'obligation' | 'advice' | 'information';
  action: string;
  parameters?: Record<string, any>;
}

export interface TimeRestriction {
  startTime?: string; // HH:MM format
  endTime?: string;   // HH:MM format
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  timezone?: string;
  validFrom?: string; // ISO date
  validTo?: string;   // ISO date
}

export interface ContextRequirement {
  type: 'mfa' | 'vpn' | 'device_trust' | 'session_age' | 'approval' | 'custom';
  value?: any;
  description?: string;
}

export interface AccessRequest {
  id: string;
  subject: {
    id: string;
    type: 'user' | 'api_key' | 'service';
    roles: string[];
    attributes: Record<string, any>;
  };
  action: {
    type: string;
    parameters?: Record<string, any>;
  };
  resource: {
    id: string;
    type: string;
    attributes: Record<string, any>;
  };
  context: {
    timestamp: string;
    ip: string;
    userAgent?: string;
    sessionId?: string;
    mfaVerified?: boolean;
    vpnConnected?: boolean;
    deviceTrusted?: boolean;
    location?: {
      country: string;
      region: string;
    };
  };
  environment: Record<string, any>;
}

export interface PolicyDecision {
  decision: 'allow' | 'deny' | 'not_applicable';
  appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    decision: 'allow' | 'deny';
    priority: number;
  }>;
  obligations: PolicyEffect[];
  advice: PolicyEffect[];
  information: PolicyEffect[];
  reason: string;
  evaluationTime: number; // milliseconds
}

export class PolicyEngine {
  private rules: PolicyRule[] = [];
  private cache: Map<string, PolicyDecision> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(rules: PolicyRule[] = []) {
    this.rules = rules.sort((a, b) => b.priority - a.priority); // Sort by priority (desc)
  }

  /**
   * Evaluate access request against policies
   */
  evaluate(request: AccessRequest): PolicyDecision {
    const startTime = Date.now();

    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    // Evaluate rules
    const appliedRules: PolicyDecision['appliedRules'] = [];
    const obligations: PolicyEffect[] = [];
    const advice: PolicyEffect[] = [];
    const information: PolicyEffect[] = [];

    let finalDecision: 'allow' | 'deny' | 'not_applicable' = 'not_applicable';
    let reason = 'No applicable rules found';

    for (const rule of this.rules) {
      if (!rule.isActive) continue;

      const ruleResult = this.evaluateRule(rule, request);

      if (ruleResult.applicable) {
        appliedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          decision: rule.type,
          priority: rule.priority,
        });

        // Collect effects
        obligations.push(...rule.effects.filter(e => e.type === 'obligation'));
        advice.push(...rule.effects.filter(e => e.type === 'advice'));
        information.push(...rule.effects.filter(e => e.type === 'information'));

        // First applicable rule determines decision (highest priority wins)
        if (finalDecision === 'not_applicable') {
          finalDecision = rule.type;
          reason = `Rule '${rule.name}' applied: ${rule.description}`;

          // If it's a deny rule, stop evaluation (deny overrides)
          if (rule.type === 'deny') {
            reason = `Access denied by rule '${rule.name}': ${rule.description}`;
            break;
          }
        }
      }
    }

    const decision: PolicyDecision = {
      decision: finalDecision,
      appliedRules,
      obligations,
      advice,
      information,
      reason,
      evaluationTime: Date.now() - startTime,
    };

    // Cache the decision
    this.cache.set(cacheKey, decision);

    return decision;
  }

  /**
   * Add or update a policy rule
   */
  addRule(rule: PolicyRule): void {
    const existingIndex = this.rules.findIndex(r => r.id === rule.id);

    if (existingIndex >= 0) {
      this.rules[existingIndex] = rule;
    } else {
      this.rules.push(rule);
    }

    // Re-sort by priority
    this.rules.sort((a, b) => b.priority - a.priority);

    // Clear cache as rules have changed
    this.cache.clear();
  }

  /**
   * Remove a policy rule
   */
  removeRule(ruleId: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(r => r.id !== ruleId);

    if (this.rules.length < initialLength) {
      this.cache.clear();
      return true;
    }

    return false;
  }

  /**
   * Test a rule against sample request
   */
  testRule(rule: PolicyRule, request: AccessRequest): {
    applicable: boolean;
    reason: string;
    conditionResults: Array<{
      condition: PolicyCondition;
      result: boolean;
      reason: string;
    }>;
  } {
    return this.evaluateRule(rule, request);
  }

  /**
   * Get all active rules for a resource type
   */
  getRulesForResource(resourceType: string): PolicyRule[] {
    return this.rules.filter(rule =>
      rule.isActive &&
      rule.resources.some(resource => resource.type === resourceType)
    );
  }

  /**
   * Generate policy simulation report
   */
  simulatePolicy(
    requests: AccessRequest[],
    rules: PolicyRule[]
  ): {
    totalRequests: number;
    allowed: number;
    denied: number;
    notApplicable: number;
    averageEvaluationTime: number;
    ruleUsage: Record<string, number>;
  } {
    const tempEngine = new PolicyEngine(rules);
    const results = requests.map(request => tempEngine.evaluate(request));

    const ruleUsage: Record<string, number> = {};
    results.forEach(result => {
      result.appliedRules.forEach(rule => {
        ruleUsage[rule.ruleId] = (ruleUsage[rule.ruleId] || 0) + 1;
      });
    });

    return {
      totalRequests: requests.length,
      allowed: results.filter(r => r.decision === 'allow').length,
      denied: results.filter(r => r.decision === 'deny').length,
      notApplicable: results.filter(r => r.decision === 'not_applicable').length,
      averageEvaluationTime: results.reduce((sum, r) => sum + r.evaluationTime, 0) / results.length,
      ruleUsage,
    };
  }

  // Private methods
  private evaluateRule(rule: PolicyRule, request: AccessRequest): {
    applicable: boolean;
    reason: string;
    conditionResults: Array<{
      condition: PolicyCondition;
      result: boolean;
      reason: string;
    }>;
  } {
    // Check if rule applies to this request
    const subjectMatches = this.matchesSubjectPattern(rule.subjects, request.subject);
    const actionMatches = this.matchesActionPattern(rule.actions, request.action);
    const resourceMatches = this.matchesResourcePattern(rule.resources, request.resource);

    if (!subjectMatches || !actionMatches || !resourceMatches) {
      return {
        applicable: false,
        reason: 'Rule patterns do not match request',
        conditionResults: [],
      };
    }

    // Evaluate conditions
    const conditionResults = rule.conditions.map(condition =>
      this.evaluateCondition(condition, request)
    );

    const allConditionsMet = conditionResults.every(result => result.result);

    // Check time restrictions
    const timeAllowed = this.checkTimeRestrictions(rule.timeRestrictions, request.context.timestamp);

    // Check IP restrictions
    const ipAllowed = this.checkIPRestrictions(rule.ipRestrictions, request.context.ip);

    // Check context requirements
    const contextAllowed = this.checkContextRequirements(rule.contextRequirements, request.context);

    const applicable = allConditionsMet && timeAllowed && ipAllowed && contextAllowed;

    return {
      applicable,
      reason: applicable ? 'All conditions met' : 'One or more conditions failed',
      conditionResults,
    };
  }

  private evaluateCondition(
    condition: PolicyCondition,
    request: AccessRequest
  ): { condition: PolicyCondition; result: boolean; reason: string } {
    const value = this.getAttributeValue(condition.attribute, request);

    let result = false;
    let reason = '';

    try {
      switch (condition.operator) {
        case 'equals':
          result = value === condition.value;
          reason = `${value} ${result ? '==' : '!='} ${condition.value}`;
          break;
        case 'not_equals':
          result = value !== condition.value;
          reason = `${value} ${result ? '!=' : '=='} ${condition.value}`;
          break;
        case 'contains':
          result = String(value).includes(String(condition.value));
          reason = `"${value}" ${result ? 'contains' : 'does not contain'} "${condition.value}"`;
          break;
        case 'starts_with':
          result = String(value).startsWith(String(condition.value));
          reason = `"${value}" ${result ? 'starts with' : 'does not start with'} "${condition.value}"`;
          break;
        case 'regex':
          const regex = new RegExp(condition.value, condition.caseSensitive ? '' : 'i');
          result = regex.test(String(value));
          reason = `"${value}" ${result ? 'matches' : 'does not match'} pattern "${condition.value}"`;
          break;
        case 'greater_than':
          result = Number(value) > Number(condition.value);
          reason = `${value} ${result ? '>' : '<='} ${condition.value}`;
          break;
        case 'less_than':
          result = Number(value) < Number(condition.value);
          reason = `${value} ${result ? '<' : '>='} ${condition.value}`;
          break;
        case 'in':
          result = Array.isArray(condition.value) && condition.value.includes(value);
          reason = `${value} ${result ? 'is in' : 'is not in'} [${condition.value}]`;
          break;
        case 'not_in':
          result = Array.isArray(condition.value) && !condition.value.includes(value);
          reason = `${value} ${result ? 'is not in' : 'is in'} [${condition.value}]`;
          break;
        default:
          reason = `Unknown operator: ${condition.operator}`;
      }
    } catch (error) {
      reason = `Error evaluating condition: ${error}`;
    }

    return { condition, result, reason };
  }

  private getAttributeValue(attribute: string, request: AccessRequest): any {
    const parts = attribute.split('.');
    let current: any = request;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  private matchesSubjectPattern(patterns: SubjectPattern[], subject: AccessRequest['subject']): boolean {
    return patterns.some(pattern => {
      if (pattern.type !== subject.type) return false;
      return this.matchesPattern(pattern.pattern, subject.id) ||
             subject.roles.some(role => this.matchesPattern(pattern.pattern, role));
    });
  }

  private matchesActionPattern(patterns: PolicyAction[], action: AccessRequest['action']): boolean {
    return patterns.some(pattern => pattern.type === action.type);
  }

  private matchesResourcePattern(patterns: ResourcePattern[], resource: AccessRequest['resource']): boolean {
    return patterns.some(pattern => {
      if (pattern.type !== resource.type) return false;
      return this.matchesPattern(pattern.pattern, resource.id);
    });
  }

  private matchesPattern(pattern: string, value: string): boolean {
    // Convert glob-like pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(value);
  }

  private checkTimeRestrictions(restrictions: TimeRestriction | undefined, timestamp: string): boolean {
    if (!restrictions) return true;

    const now = new Date(timestamp);

    // Check date range
    if (restrictions.validFrom && now < new Date(restrictions.validFrom)) return false;
    if (restrictions.validTo && now > new Date(restrictions.validTo)) return false;

    // Check day of week
    if (restrictions.daysOfWeek && !restrictions.daysOfWeek.includes(now.getDay())) return false;

    // Check time of day
    if (restrictions.startTime || restrictions.endTime) {
      const timeStr = now.toTimeString().substr(0, 5); // HH:MM
      if (restrictions.startTime && timeStr < restrictions.startTime) return false;
      if (restrictions.endTime && timeStr > restrictions.endTime) return false;
    }

    return true;
  }

  private checkIPRestrictions(restrictions: string[] | undefined, ip: string): boolean {
    if (!restrictions || restrictions.length === 0) return true;

    // Simple IP range check - in production, use proper CIDR library
    return restrictions.some(range => {
      if (range.includes('/')) {
        // CIDR notation - simplified check
        const [network, bits] = range.split('/');
        return ip.startsWith(network.split('.').slice(0, parseInt(bits) / 8).join('.'));
      } else {
        // Exact match
        return ip === range;
      }
    });
  }

  private checkContextRequirements(requirements: ContextRequirement[] | undefined, context: AccessRequest['context']): boolean {
    if (!requirements || requirements.length === 0) return true;

    return requirements.every(req => {
      switch (req.type) {
        case 'mfa':
          return context.mfaVerified === true;
        case 'vpn':
          return context.vpnConnected === true;
        case 'device_trust':
          return context.deviceTrusted === true;
        case 'session_age':
          // Check if session is not too old
          const maxAge = req.value || 3600000; // Default 1 hour
          return true; // Simplified - would need session start time
        default:
          return true;
      }
    });
  }

  private generateCacheKey(request: AccessRequest): string {
    return `${request.subject.id}:${request.action.type}:${request.resource.id}:${request.context.timestamp}`;
  }

  private isCacheValid(cacheKey: string): boolean {
    // Simple time-based cache invalidation
    return true; // Simplified implementation
  }
}

// Predefined policy templates
export const POLICY_TEMPLATES = {
  KKKS_DATA_ACCESS: {
    name: 'KKKS Data Provider Access',
    description: 'KKKS users can only access their own organization data',
    type: 'allow' as const,
    priority: 100,
    conditions: [
      {
        type: 'attribute' as const,
        operator: 'equals' as const,
        attribute: 'subject.attributes.organization',
        value: '{resource.attributes.operator}',
      },
    ],
    actions: [
      { type: 'read' as const },
      { type: 'write' as const },
      { type: 'update' as const },
    ],
    resources: [
      {
        type: 'metadata' as const,
        pattern: '*',
      },
    ],
    subjects: [
      {
        type: 'role' as const,
        pattern: 'KKKS-Provider',
      },
    ],
    effects: [],
  },

  SKK_READ_ONLY: {
    name: 'SKK Migas Read Access',
    description: 'SKK Migas users have read-only access to all approved data',
    type: 'allow' as const,
    priority: 90,
    conditions: [
      {
        type: 'attribute' as const,
        operator: 'equals' as const,
        attribute: 'resource.attributes.approvalStatus',
        value: 'approved',
      },
    ],
    actions: [
      { type: 'read' as const },
      { type: 'download' as const },
    ],
    resources: [
      {
        type: 'metadata' as const,
        pattern: '*',
      },
    ],
    subjects: [
      {
        type: 'role' as const,
        pattern: 'SKK-Consumer',
      },
    ],
    effects: [
      {
        type: 'obligation' as const,
        action: 'log_access',
        parameters: { level: 'info' },
      },
    ],
  },

  CONFIDENTIAL_DATA_MFA: {
    name: 'Confidential Data MFA Required',
    description: 'Access to confidential data requires MFA verification',
    type: 'deny' as const,
    priority: 200,
    conditions: [
      {
        type: 'attribute' as const,
        operator: 'equals' as const,
        attribute: 'resource.attributes.dataClassification',
        value: 'Confidential',
      },
    ],
    actions: [
      { type: 'read' as const },
      { type: 'download' as const },
      { type: 'export' as const },
    ],
    resources: [
      {
        type: 'metadata' as const,
        pattern: '*',
      },
    ],
    subjects: [
      {
        type: 'user' as const,
        pattern: '*',
      },
    ],
    effects: [],
    contextRequirements: [
      {
        type: 'mfa' as const,
        description: 'Multi-factor authentication required',
      },
    ],
  },
};

export default PolicyEngine;