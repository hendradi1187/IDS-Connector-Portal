import { z } from 'zod';
import { ApprovalWorkflowService, WorkflowInstance } from '../workflow/approval-workflow';

// Contract Negotiation Workflow System
export interface ContractNegotiation {
  id: string;
  contractId: string;
  initiatedBy: string;
  participants: NegotiationParticipant[];
  status: 'initiated' | 'in_progress' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled';
  currentRound: number;
  proposals: NegotiationProposal[];
  messages: NegotiationMessage[];
  timeline: NegotiationEvent[];
  deadlines: {
    responseDeadline?: string;
    finalDeadline?: string;
  };
  settings: {
    maxRounds: number;
    autoApprovalThreshold?: number;
    allowCounterOffers: boolean;
    requireUnanimous: boolean;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface NegotiationParticipant {
  userId: string;
  organizationId: string;
  role: 'initiator' | 'provider' | 'consumer' | 'mediator' | 'observer';
  permissions: {
    canPropose: boolean;
    canApprove: boolean;
    canVeto: boolean;
    canComment: boolean;
  };
  status: 'active' | 'inactive' | 'withdrawn';
  joinedAt: string;
  lastActivity?: string;
}

export interface NegotiationProposal {
  id: string;
  negotiationId: string;
  proposedBy: string;
  round: number;
  contractTerms: ContractTerms;
  changes: ContractChange[];
  justification: string;
  responses: ProposalResponse[];
  status: 'pending' | 'accepted' | 'rejected' | 'superseded';
  submittedAt: string;
  deadline?: string;
}

export interface ContractTerms {
  title: string;
  parties: Array<{
    id: string;
    name: string;
    role: 'provider' | 'consumer';
    organization: string;
  }>;
  scope: {
    dataTypes: string[];
    geographicalScope: string[];
    temporalScope: {
      startDate: string;
      endDate?: string;
      duration?: string;
    };
    volumeLimit?: {
      amount: number;
      unit: string;
    };
  };
  pricing: {
    model: 'free' | 'fixed' | 'usage_based' | 'subscription';
    amount?: number;
    currency?: string;
    billingPeriod?: 'monthly' | 'quarterly' | 'annually';
    usageRate?: number;
  };
  accessControl: {
    permittedUsers: string[];
    permittedUses: string[];
    restrictions: string[];
    retentionPeriod?: string;
    deletionRequirements?: string[];
  };
  qualityAssurance: {
    slaTargets: Record<string, number>;
    penaltyClause?: string;
    monitoringRequirements?: string[];
  };
  compliance: {
    regulations: string[];
    certifications: string[];
    auditRequirements: string[];
  };
  termination: {
    noticePeriod: string;
    terminationConditions: string[];
    dataHandlingPostTermination: string;
  };
  disputeResolution: {
    mechanism: 'negotiation' | 'mediation' | 'arbitration' | 'litigation';
    jurisdiction: string;
    governingLaw: string;
  };
}

export interface ContractChange {
  section: string;
  field: string;
  operation: 'add' | 'modify' | 'remove';
  oldValue?: any;
  newValue?: any;
  reason: string;
}

export interface ProposalResponse {
  id: string;
  proposalId: string;
  respondentId: string;
  response: 'accept' | 'reject' | 'counter_offer';
  counterProposalId?: string;
  comments?: string;
  respondedAt: string;
  deadline?: string;
}

export interface NegotiationMessage {
  id: string;
  negotiationId: string;
  senderId: string;
  recipientIds: string[];
  type: 'comment' | 'question' | 'clarification' | 'objection' | 'system';
  subject?: string;
  content: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  relatedProposalId?: string;
  isPrivate: boolean;
  sentAt: string;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
}

export interface NegotiationEvent {
  id: string;
  negotiationId: string;
  type: 'initiated' | 'proposal_submitted' | 'response_received' | 'deadline_extended' | 'participant_added' | 'completed' | 'cancelled';
  actor: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface NegotiationTemplate {
  id: string;
  name: string;
  description: string;
  contractType: string;
  defaultTerms: Partial<ContractTerms>;
  mandatoryFields: string[];
  negotiableFields: string[];
  workflow: {
    maxRounds: number;
    responseTimeHours: number;
    requireUnanimous: boolean;
    allowCounterOffers: boolean;
  };
  createdBy: string;
  isActive: boolean;
}

export class ContractNegotiationService {

  /**
   * Initiate a new contract negotiation
   */
  static initiateNegotiation(
    contractId: string,
    initiatorId: string,
    participants: Omit<NegotiationParticipant, 'joinedAt' | 'status'>[],
    initialTerms: ContractTerms,
    settings?: Partial<ContractNegotiation['settings']>
  ): ContractNegotiation {
    const negotiationId = this.generateNegotiationId();

    const negotiation: ContractNegotiation = {
      id: negotiationId,
      contractId,
      initiatedBy: initiatorId,
      participants: participants.map(p => ({
        ...p,
        status: 'active',
        joinedAt: new Date().toISOString(),
      })),
      status: 'initiated',
      currentRound: 1,
      proposals: [],
      messages: [],
      timeline: [{
        id: this.generateEventId(),
        negotiationId,
        type: 'initiated',
        actor: initiatorId,
        description: 'Contract negotiation initiated',
        timestamp: new Date().toISOString(),
      }],
      deadlines: {},
      settings: {
        maxRounds: 5,
        allowCounterOffers: true,
        requireUnanimous: false,
        ...settings,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create initial proposal
    const initialProposal = this.createProposal(
      negotiationId,
      initiatorId,
      1,
      initialTerms,
      [],
      'Initial contract proposal'
    );

    negotiation.proposals.push(initialProposal);
    negotiation.status = 'in_progress';

    // Send notifications to participants
    this.notifyParticipants(negotiation, 'New contract negotiation started');

    return negotiation;
  }

  /**
   * Submit a counter-proposal
   */
  static submitCounterProposal(
    negotiationId: string,
    proposerId: string,
    baseProposalId: string,
    modifiedTerms: ContractTerms,
    changes: ContractChange[],
    justification: string
  ): NegotiationProposal {
    const negotiation = this.getNegotiation(negotiationId);

    if (!this.canUserPropose(negotiation, proposerId)) {
      throw new Error('User is not authorized to submit proposals');
    }

    if (negotiation.currentRound >= negotiation.settings.maxRounds) {
      throw new Error('Maximum negotiation rounds exceeded');
    }

    const proposal = this.createProposal(
      negotiationId,
      proposerId,
      negotiation.currentRound + 1,
      modifiedTerms,
      changes,
      justification
    );

    // Update negotiation
    negotiation.proposals.push(proposal);
    negotiation.currentRound++;
    negotiation.updatedAt = new Date().toISOString();

    // Add event to timeline
    negotiation.timeline.push({
      id: this.generateEventId(),
      negotiationId,
      type: 'proposal_submitted',
      actor: proposerId,
      description: `Counter-proposal submitted for round ${proposal.round}`,
      metadata: { proposalId: proposal.id },
      timestamp: new Date().toISOString(),
    });

    // Notify participants
    this.notifyParticipants(negotiation, `New counter-proposal submitted by ${proposerId}`);

    return proposal;
  }

  /**
   * Respond to a proposal
   */
  static respondToProposal(
    proposalId: string,
    respondentId: string,
    response: 'accept' | 'reject' | 'counter_offer',
    comments?: string,
    counterProposalId?: string
  ): ProposalResponse {
    const proposal = this.getProposal(proposalId);
    const negotiation = this.getNegotiation(proposal.negotiationId);

    if (!this.canUserRespond(negotiation, respondentId)) {
      throw new Error('User is not authorized to respond to proposals');
    }

    // Check if user already responded
    const existingResponse = proposal.responses.find(r => r.respondentId === respondentId);
    if (existingResponse) {
      throw new Error('User has already responded to this proposal');
    }

    const proposalResponse: ProposalResponse = {
      id: this.generateResponseId(),
      proposalId,
      respondentId,
      response,
      counterProposalId,
      comments,
      respondedAt: new Date().toISOString(),
    };

    proposal.responses.push(proposalResponse);

    // Check if all required responses are received
    const requiredResponses = this.getRequiredResponders(negotiation, proposal);
    const receivedResponses = proposal.responses.length;

    if (receivedResponses >= requiredResponses.length) {
      // Evaluate proposal based on responses
      const result = this.evaluateProposalResponses(proposal, negotiation);

      if (result.decision === 'accepted') {
        proposal.status = 'accepted';
        negotiation.status = 'pending_approval';

        // Start approval workflow
        this.startApprovalWorkflow(negotiation, proposal);
      } else if (result.decision === 'rejected') {
        proposal.status = 'rejected';

        if (negotiation.currentRound >= negotiation.settings.maxRounds) {
          negotiation.status = 'rejected';
          negotiation.completedAt = new Date().toISOString();
        }
      }
    }

    // Add event to timeline
    negotiation.timeline.push({
      id: this.generateEventId(),
      negotiationId: negotiation.id,
      type: 'response_received',
      actor: respondentId,
      description: `Response received: ${response}`,
      metadata: { proposalId, response },
      timestamp: new Date().toISOString(),
    });

    negotiation.updatedAt = new Date().toISOString();

    return proposalResponse;
  }

  /**
   * Send a message in the negotiation
   */
  static sendMessage(
    negotiationId: string,
    senderId: string,
    content: string,
    options?: {
      recipientIds?: string[];
      subject?: string;
      type?: NegotiationMessage['type'];
      relatedProposalId?: string;
      isPrivate?: boolean;
      attachments?: NegotiationMessage['attachments'];
    }
  ): NegotiationMessage {
    const negotiation = this.getNegotiation(negotiationId);

    if (!this.isParticipant(negotiation, senderId)) {
      throw new Error('User is not a participant in this negotiation');
    }

    const message: NegotiationMessage = {
      id: this.generateMessageId(),
      negotiationId,
      senderId,
      recipientIds: options?.recipientIds || negotiation.participants.map(p => p.userId),
      type: options?.type || 'comment',
      subject: options?.subject,
      content,
      attachments: options?.attachments,
      relatedProposalId: options?.relatedProposalId,
      isPrivate: options?.isPrivate || false,
      sentAt: new Date().toISOString(),
      readBy: [],
    };

    negotiation.messages.push(message);
    negotiation.updatedAt = new Date().toISOString();

    // Notify recipients
    this.notifyMessageRecipients(message, negotiation);

    return message;
  }

  /**
   * Extend negotiation deadline
   */
  static extendDeadline(
    negotiationId: string,
    requesterId: string,
    newDeadline: string,
    reason: string
  ): ContractNegotiation {
    const negotiation = this.getNegotiation(negotiationId);

    if (!this.canUserManageDeadlines(negotiation, requesterId)) {
      throw new Error('User is not authorized to extend deadlines');
    }

    negotiation.deadlines.finalDeadline = newDeadline;
    negotiation.updatedAt = new Date().toISOString();

    // Add event to timeline
    negotiation.timeline.push({
      id: this.generateEventId(),
      negotiationId,
      type: 'deadline_extended',
      actor: requesterId,
      description: `Deadline extended to ${newDeadline}: ${reason}`,
      metadata: { newDeadline, reason },
      timestamp: new Date().toISOString(),
    });

    // Notify participants
    this.notifyParticipants(negotiation, `Negotiation deadline extended to ${newDeadline}`);

    return negotiation;
  }

  /**
   * Cancel negotiation
   */
  static cancelNegotiation(
    negotiationId: string,
    cancelledBy: string,
    reason: string
  ): ContractNegotiation {
    const negotiation = this.getNegotiation(negotiationId);

    if (!this.canUserCancelNegotiation(negotiation, cancelledBy)) {
      throw new Error('User is not authorized to cancel this negotiation');
    }

    negotiation.status = 'cancelled';
    negotiation.completedAt = new Date().toISOString();
    negotiation.updatedAt = new Date().toISOString();

    // Add event to timeline
    negotiation.timeline.push({
      id: this.generateEventId(),
      negotiationId,
      type: 'cancelled',
      actor: cancelledBy,
      description: `Negotiation cancelled: ${reason}`,
      metadata: { reason },
      timestamp: new Date().toISOString(),
    });

    // Notify participants
    this.notifyParticipants(negotiation, `Negotiation cancelled: ${reason}`);

    return negotiation;
  }

  /**
   * Get negotiation analytics
   */
  static getNegotiationAnalytics(negotiationId: string): {
    duration: number; // hours
    totalProposals: number;
    totalMessages: number;
    participantActivity: Array<{
      userId: string;
      proposalsSubmitted: number;
      responsesProvided: number;
      messagesSet: number;
      lastActivity: string;
    }>;
    roundSummary: Array<{
      round: number;
      proposalsCount: number;
      avgResponseTime: number; // hours
      status: string;
    }>;
  } {
    const negotiation = this.getNegotiation(negotiationId);

    const startTime = new Date(negotiation.createdAt);
    const endTime = negotiation.completedAt ? new Date(negotiation.completedAt) : new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    const participantActivity = negotiation.participants.map(participant => {
      const proposalsSubmitted = negotiation.proposals.filter(p => p.proposedBy === participant.userId).length;
      const responsesProvided = negotiation.proposals.reduce(
        (count, proposal) => count + proposal.responses.filter(r => r.respondentId === participant.userId).length,
        0
      );
      const messagesSet = negotiation.messages.filter(m => m.senderId === participant.userId).length;

      return {
        userId: participant.userId,
        proposalsSubmitted,
        responsesProvided,
        messagesSet,
        lastActivity: participant.lastActivity || participant.joinedAt,
      };
    });

    const roundSummary: any[] = [];
    for (let round = 1; round <= negotiation.currentRound; round++) {
      const roundProposals = negotiation.proposals.filter(p => p.round === round);
      roundSummary.push({
        round,
        proposalsCount: roundProposals.length,
        avgResponseTime: this.calculateAverageResponseTime(roundProposals),
        status: roundProposals.length > 0 ? roundProposals[0].status : 'pending',
      });
    }

    return {
      duration,
      totalProposals: negotiation.proposals.length,
      totalMessages: negotiation.messages.length,
      participantActivity,
      roundSummary,
    };
  }

  // Private helper methods
  private static createProposal(
    negotiationId: string,
    proposerId: string,
    round: number,
    terms: ContractTerms,
    changes: ContractChange[],
    justification: string
  ): NegotiationProposal {
    return {
      id: this.generateProposalId(),
      negotiationId,
      proposedBy: proposerId,
      round,
      contractTerms: terms,
      changes,
      justification,
      responses: [],
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
  }

  private static canUserPropose(negotiation: ContractNegotiation, userId: string): boolean {
    const participant = negotiation.participants.find(p => p.userId === userId);
    return participant?.permissions.canPropose === true && participant.status === 'active';
  }

  private static canUserRespond(negotiation: ContractNegotiation, userId: string): boolean {
    const participant = negotiation.participants.find(p => p.userId === userId);
    return participant?.permissions.canApprove === true && participant.status === 'active';
  }

  private static isParticipant(negotiation: ContractNegotiation, userId: string): boolean {
    return negotiation.participants.some(p => p.userId === userId && p.status === 'active');
  }

  private static canUserManageDeadlines(negotiation: ContractNegotiation, userId: string): boolean {
    return negotiation.initiatedBy === userId || this.isUserMediator(negotiation, userId);
  }

  private static canUserCancelNegotiation(negotiation: ContractNegotiation, userId: string): boolean {
    return negotiation.initiatedBy === userId || this.isUserMediator(negotiation, userId);
  }

  private static isUserMediator(negotiation: ContractNegotiation, userId: string): boolean {
    return negotiation.participants.some(p => p.userId === userId && p.role === 'mediator');
  }

  private static getRequiredResponders(
    negotiation: ContractNegotiation,
    proposal: NegotiationProposal
  ): string[] {
    return negotiation.participants
      .filter(p => p.permissions.canApprove && p.userId !== proposal.proposedBy)
      .map(p => p.userId);
  }

  private static evaluateProposalResponses(
    proposal: NegotiationProposal,
    negotiation: ContractNegotiation
  ): { decision: 'accepted' | 'rejected' | 'pending'; reason: string } {
    const responses = proposal.responses;
    const acceptances = responses.filter(r => r.response === 'accept').length;
    const rejections = responses.filter(r => r.response === 'reject').length;

    if (negotiation.settings.requireUnanimous) {
      if (rejections > 0) {
        return { decision: 'rejected', reason: 'Unanimous approval required but rejections received' };
      }
      if (acceptances === responses.length) {
        return { decision: 'accepted', reason: 'Unanimous approval achieved' };
      }
    } else {
      const approvalThreshold = negotiation.settings.autoApprovalThreshold || 0.5;
      const approvalRate = acceptances / responses.length;

      if (approvalRate >= approvalThreshold) {
        return { decision: 'accepted', reason: `Approval threshold (${approvalThreshold}) met` };
      }
      if (rejections > responses.length - Math.ceil(responses.length * approvalThreshold)) {
        return { decision: 'rejected', reason: 'Too many rejections to meet approval threshold' };
      }
    }

    return { decision: 'pending', reason: 'Waiting for more responses' };
  }

  private static startApprovalWorkflow(
    negotiation: ContractNegotiation,
    proposal: NegotiationProposal
  ): void {
    // Integration with approval workflow system
    const workflowInstance = ApprovalWorkflowService.startWorkflow(
      negotiation.contractId,
      'contract',
      {
        negotiationId: negotiation.id,
        proposalId: proposal.id,
        contractTerms: proposal.contractTerms,
      },
      negotiation.initiatedBy
    );

    // Update negotiation status
    negotiation.status = 'pending_approval';
  }

  private static calculateAverageResponseTime(proposals: NegotiationProposal[]): number {
    if (proposals.length === 0) return 0;

    const responseTimes = proposals.flatMap(proposal =>
      proposal.responses.map(response => {
        const submittedTime = new Date(proposal.submittedAt);
        const respondedTime = new Date(response.respondedAt);
        return (respondedTime.getTime() - submittedTime.getTime()) / (1000 * 60 * 60); // hours
      })
    );

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  private static notifyParticipants(negotiation: ContractNegotiation, message: string): void {
    // In real implementation, send notifications to all participants
    console.log(`Notification to ${negotiation.participants.length} participants: ${message}`);
  }

  private static notifyMessageRecipients(message: NegotiationMessage, negotiation: ContractNegotiation): void {
    // In real implementation, send message notifications
    console.log(`Message notification sent to ${message.recipientIds.length} recipients`);
  }

  private static getNegotiation(negotiationId: string): ContractNegotiation {
    // Mock implementation - in real app, fetch from database
    return this.createMockNegotiation(negotiationId);
  }

  private static getProposal(proposalId: string): NegotiationProposal {
    // Mock implementation - in real app, fetch from database
    return this.createMockProposal(proposalId);
  }

  private static createMockNegotiation(id: string): ContractNegotiation {
    return {
      id,
      contractId: 'contract-123',
      initiatedBy: 'user1',
      participants: [
        {
          userId: 'user1',
          organizationId: 'org1',
          role: 'initiator',
          permissions: { canPropose: true, canApprove: true, canVeto: false, canComment: true },
          status: 'active',
          joinedAt: new Date().toISOString(),
        },
      ],
      status: 'in_progress',
      currentRound: 1,
      proposals: [],
      messages: [],
      timeline: [],
      deadlines: {},
      settings: {
        maxRounds: 5,
        allowCounterOffers: true,
        requireUnanimous: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private static createMockProposal(id: string): NegotiationProposal {
    return {
      id,
      negotiationId: 'neg-123',
      proposedBy: 'user1',
      round: 1,
      contractTerms: {} as ContractTerms,
      changes: [],
      justification: 'Initial proposal',
      responses: [],
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
  }

  private static generateNegotiationId(): string {
    return `neg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateProposalId(): string {
    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ContractNegotiationService;