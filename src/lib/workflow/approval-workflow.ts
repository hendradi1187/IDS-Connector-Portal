import { z } from 'zod';

// Workflow Approval System for Metadata Management
export interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approve' | 'validate' | 'notify';
  assigneeRole: string;
  assigneeId?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'rejected';
  completedAt?: string;
  completedBy?: string;
  comments?: string;
  requiredActions: string[];
  timeoutHours?: number;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  entityType: 'metadata' | 'contract' | 'policy';
  triggerConditions: {
    changeType?: 'major' | 'minor' | 'patch';
    dataClassification?: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
    operator?: string;
    minimumValue?: number;
  };
  steps: WorkflowStep[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  entityId: string;
  entityType: string;
  entityData: Record<string, any>;
  currentStep: number;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'cancelled';
  submittedBy: string;
  submittedAt: string;
  completedAt?: string;
  history: WorkflowAction[];
  notifications: WorkflowNotification[];
}

export interface WorkflowAction {
  id: string;
  stepId: string;
  action: 'start' | 'complete' | 'reject' | 'skip' | 'reassign' | 'comment';
  performedBy: string;
  performedAt: string;
  comments?: string;
  previousAssignee?: string;
  newAssignee?: string;
}

export interface WorkflowNotification {
  id: string;
  recipientId: string;
  type: 'assignment' | 'reminder' | 'completion' | 'rejection';
  title: string;
  message: string;
  sentAt: string;
  readAt?: string;
}

export class ApprovalWorkflowService {

  /**
   * Create a new workflow template
   */
  static createWorkflow(
    name: string,
    description: string,
    entityType: 'metadata' | 'contract' | 'policy',
    steps: Omit<WorkflowStep, 'id' | 'status'>[],
    triggerConditions: ApprovalWorkflow['triggerConditions'],
    createdBy: string
  ): ApprovalWorkflow {
    return {
      id: this.generateWorkflowId(),
      name,
      description,
      entityType,
      triggerConditions,
      steps: steps.map(step => ({
        ...step,
        id: this.generateStepId(),
        status: 'pending',
      })),
      createdBy,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
  }

  /**
   * Start workflow for an entity
   */
  static startWorkflow(
    entityId: string,
    entityType: string,
    entityData: Record<string, any>,
    submittedBy: string
  ): WorkflowInstance {
    const workflow = this.findApplicableWorkflow(entityType, entityData);

    if (!workflow) {
      throw new Error(`No applicable workflow found for ${entityType}`);
    }

    const instance: WorkflowInstance = {
      id: this.generateInstanceId(),
      workflowId: workflow.id,
      entityId,
      entityType,
      entityData,
      currentStep: 0,
      status: 'pending',
      submittedBy,
      submittedAt: new Date().toISOString(),
      history: [],
      notifications: [],
    };

    // Start first step
    this.advanceToNextStep(instance);

    return instance;
  }

  /**
   * Process workflow action (approve, reject, etc.)
   */
  static processAction(
    instanceId: string,
    stepId: string,
    action: WorkflowAction['action'],
    performedBy: string,
    comments?: string
  ): WorkflowInstance {
    const instance = this.getWorkflowInstance(instanceId);
    const workflow = this.getWorkflow(instance.workflowId);
    const currentStep = workflow.steps[instance.currentStep];

    if (currentStep.id !== stepId) {
      throw new Error('Invalid step for current workflow state');
    }

    // Record action
    const workflowAction: WorkflowAction = {
      id: this.generateActionId(),
      stepId,
      action,
      performedBy,
      performedAt: new Date().toISOString(),
      comments,
    };

    instance.history.push(workflowAction);

    // Process action
    switch (action) {
      case 'complete':
        currentStep.status = 'completed';
        currentStep.completedAt = new Date().toISOString();
        currentStep.completedBy = performedBy;
        currentStep.comments = comments;

        // Move to next step or complete workflow
        if (instance.currentStep < workflow.steps.length - 1) {
          instance.currentStep++;
          this.advanceToNextStep(instance);
        } else {
          instance.status = 'approved';
          instance.completedAt = new Date().toISOString();
          this.sendNotification(instance, 'completion', 'Workflow completed successfully');
        }
        break;

      case 'reject':
        currentStep.status = 'rejected';
        currentStep.completedAt = new Date().toISOString();
        currentStep.completedBy = performedBy;
        currentStep.comments = comments;
        instance.status = 'rejected';
        instance.completedAt = new Date().toISOString();
        this.sendNotification(instance, 'rejection', `Workflow rejected: ${comments}`);
        break;

      case 'skip':
        currentStep.status = 'skipped';
        currentStep.completedAt = new Date().toISOString();
        currentStep.completedBy = performedBy;
        currentStep.comments = comments;

        if (instance.currentStep < workflow.steps.length - 1) {
          instance.currentStep++;
          this.advanceToNextStep(instance);
        } else {
          instance.status = 'approved';
          instance.completedAt = new Date().toISOString();
        }
        break;

      case 'reassign':
        // Handle reassignment logic
        break;
    }

    return instance;
  }

  /**
   * Get workflow instance status
   */
  static getWorkflowStatus(instanceId: string): {
    instance: WorkflowInstance;
    workflow: ApprovalWorkflow;
    currentStep?: WorkflowStep;
    nextSteps: WorkflowStep[];
    canAdvance: boolean;
  } {
    const instance = this.getWorkflowInstance(instanceId);
    const workflow = this.getWorkflow(instance.workflowId);
    const currentStep = workflow.steps[instance.currentStep];
    const nextSteps = workflow.steps.slice(instance.currentStep + 1);

    return {
      instance,
      workflow,
      currentStep,
      nextSteps,
      canAdvance: currentStep?.status === 'completed' && instance.status === 'in-progress',
    };
  }

  /**
   * Get pending workflows for user
   */
  static getPendingWorkflows(userId: string, role: string): WorkflowInstance[] {
    // In real implementation, query database for pending workflows
    return this.mockPendingWorkflows().filter(instance => {
      const workflow = this.getWorkflow(instance.workflowId);
      const currentStep = workflow.steps[instance.currentStep];
      return currentStep.assigneeRole === role || currentStep.assigneeId === userId;
    });
  }

  /**
   * Send notifications for workflow events
   */
  static sendNotification(
    instance: WorkflowInstance,
    type: WorkflowNotification['type'],
    message: string,
    recipientId?: string
  ): void {
    const notification: WorkflowNotification = {
      id: this.generateNotificationId(),
      recipientId: recipientId || instance.submittedBy,
      type,
      title: `Workflow ${type}`,
      message,
      sentAt: new Date().toISOString(),
    };

    instance.notifications.push(notification);

    // In real implementation, send email/SMS/push notification
    console.log(`Notification sent: ${notification.title} - ${notification.message}`);
  }

  /**
   * Cancel workflow
   */
  static cancelWorkflow(instanceId: string, cancelledBy: string, reason: string): WorkflowInstance {
    const instance = this.getWorkflowInstance(instanceId);

    instance.status = 'cancelled';
    instance.completedAt = new Date().toISOString();

    const cancelAction: WorkflowAction = {
      id: this.generateActionId(),
      stepId: '',
      action: 'comment',
      performedBy: cancelledBy,
      performedAt: new Date().toISOString(),
      comments: `Workflow cancelled: ${reason}`,
    };

    instance.history.push(cancelAction);

    return instance;
  }

  // Private helper methods
  private static findApplicableWorkflow(
    entityType: string,
    entityData: Record<string, any>
  ): ApprovalWorkflow | null {
    const workflows = this.getActiveWorkflows();

    return workflows.find(workflow => {
      if (workflow.entityType !== entityType) return false;

      const conditions = workflow.triggerConditions;

      // Check trigger conditions
      if (conditions.changeType && entityData.changeType !== conditions.changeType) {
        return false;
      }

      if (conditions.dataClassification && entityData.dataClassification !== conditions.dataClassification) {
        return false;
      }

      if (conditions.operator && entityData.operator !== conditions.operator) {
        return false;
      }

      if (conditions.minimumValue && (entityData.value || 0) < conditions.minimumValue) {
        return false;
      }

      return true;
    }) || null;
  }

  private static advanceToNextStep(instance: WorkflowInstance): void {
    const workflow = this.getWorkflow(instance.workflowId);
    const currentStep = workflow.steps[instance.currentStep];

    currentStep.status = 'in-progress';
    instance.status = 'in-progress';

    // Send assignment notification
    this.sendNotification(
      instance,
      'assignment',
      `You have been assigned to ${currentStep.name} for ${instance.entityType} ${instance.entityId}`,
      currentStep.assigneeId
    );
  }

  private static getWorkflowInstance(instanceId: string): WorkflowInstance {
    // Mock implementation - in real app, fetch from database
    return this.mockWorkflowInstances().find(i => i.id === instanceId) ||
           this.createMockInstance(instanceId);
  }

  private static getWorkflow(workflowId: string): ApprovalWorkflow {
    return this.getActiveWorkflows().find(w => w.id === workflowId) ||
           this.createMockWorkflow(workflowId);
  }

  private static getActiveWorkflows(): ApprovalWorkflow[] {
    return [
      {
        id: 'wf-metadata-1',
        name: 'Standard Metadata Approval',
        description: 'Standard approval process for metadata changes',
        entityType: 'metadata',
        triggerConditions: {
          changeType: 'major',
          dataClassification: 'Confidential',
        },
        steps: [
          {
            id: 'step-1',
            name: 'Technical Review',
            type: 'review',
            assigneeRole: 'Data Steward',
            status: 'pending',
            requiredActions: ['Validate schema', 'Check completeness'],
            timeoutHours: 48,
          },
          {
            id: 'step-2',
            name: 'Business Approval',
            type: 'approve',
            assigneeRole: 'Data Owner',
            status: 'pending',
            requiredActions: ['Approve business impact'],
            timeoutHours: 72,
          },
        ],
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ];
  }

  private static mockPendingWorkflows(): WorkflowInstance[] {
    return [
      {
        id: 'inst-1',
        workflowId: 'wf-metadata-1',
        entityId: 'meta-123',
        entityType: 'metadata',
        entityData: { name: 'Well Data Update' },
        currentStep: 0,
        status: 'in-progress',
        submittedBy: 'user1',
        submittedAt: new Date().toISOString(),
        history: [],
        notifications: [],
      },
    ];
  }

  private static mockWorkflowInstances(): WorkflowInstance[] {
    return this.mockPendingWorkflows();
  }

  private static createMockInstance(instanceId: string): WorkflowInstance {
    return {
      id: instanceId,
      workflowId: 'wf-metadata-1',
      entityId: 'meta-123',
      entityType: 'metadata',
      entityData: {},
      currentStep: 0,
      status: 'pending',
      submittedBy: 'user1',
      submittedAt: new Date().toISOString(),
      history: [],
      notifications: [],
    };
  }

  private static createMockWorkflow(workflowId: string): ApprovalWorkflow {
    return this.getActiveWorkflows()[0];
  }

  private static generateWorkflowId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateInstanceId(): string {
    return `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Predefined workflow templates
export const DEFAULT_WORKFLOWS = {
  METADATA_MAJOR_CHANGE: {
    name: 'Major Metadata Change Approval',
    description: 'Approval workflow for major metadata changes requiring stakeholder review',
    entityType: 'metadata' as const,
    triggerConditions: {
      changeType: 'major' as const,
    },
    steps: [
      {
        name: 'Schema Validation',
        type: 'validate' as const,
        assigneeRole: 'System',
        requiredActions: ['Validate against schema', 'Check data integrity'],
        timeoutHours: 1,
      },
      {
        name: 'Data Steward Review',
        type: 'review' as const,
        assigneeRole: 'Data Steward',
        requiredActions: ['Review metadata quality', 'Validate business rules'],
        timeoutHours: 48,
      },
      {
        name: 'Data Owner Approval',
        type: 'approve' as const,
        assigneeRole: 'Data Owner',
        requiredActions: ['Approve for publication'],
        timeoutHours: 72,
      },
    ],
  },

  CONTRACT_APPROVAL: {
    name: 'Contract Approval Workflow',
    description: 'Standard workflow for contract approval and execution',
    entityType: 'contract' as const,
    triggerConditions: {},
    steps: [
      {
        name: 'Legal Review',
        type: 'review' as const,
        assigneeRole: 'Legal',
        requiredActions: ['Review terms and conditions', 'Verify compliance'],
        timeoutHours: 120,
      },
      {
        name: 'Business Approval',
        type: 'approve' as const,
        assigneeRole: 'Business Owner',
        requiredActions: ['Approve business terms'],
        timeoutHours: 72,
      },
      {
        name: 'Executive Sign-off',
        type: 'approve' as const,
        assigneeRole: 'Executive',
        requiredActions: ['Final approval and signature'],
        timeoutHours: 168,
      },
    ],
  },
};

export default ApprovalWorkflowService;