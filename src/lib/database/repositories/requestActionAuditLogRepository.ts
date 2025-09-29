import { prisma } from '../prisma';
import { RequestActionAuditLog, RequestActionType, RequestActionStatus, RequestStatus, SecurityLevel } from '@/generated/prisma';
import { createHash } from 'crypto';

export class RequestActionAuditLogRepository {

  /**
   * TC-19: Create immutable request action audit log
   */
  async create(data: Omit<RequestActionAuditLog, 'id' | 'timestamp' | 'integrityHash'>) {
    // Generate integrity hash for immutability
    const integrityHash = this.generateIntegrityHash(data);

    const requestLog = await prisma.requestActionAuditLog.create({
      data: {
        ...data,
        integrityHash,
        timestamp: new Date()
      },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        authorizedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        delegate: {
          select: { id: true, name: true, email: true, role: true }
        },
        request: {
          select: {
            id: true,
            requestType: true,
            status: true,
            resource: {
              select: { id: true, name: true, type: true }
            }
          }
        },
        contract: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    return requestLog;
  }

  /**
   * TC-19: Log request submission
   */
  async logRequestSubmission(
    requestId: string,
    performedByUserId: string,
    dataRequested: any,
    businessJustification?: string,
    projectCode?: string,
    contractId?: string,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ) {
    return this.create({
      requestId,
      actionType: RequestActionType.SUBMIT,
      actionStatus: RequestActionStatus.SUCCESS,
      performedByUserId,
      authorizedByUserId: null,
      delegateUserId: null,
      previousStatus: null,
      newStatus: RequestStatus.pending,
      statusReason: 'Request submitted for review',
      approvalLevel: 1,
      requiredApprovals: 1,
      currentApprovals: 0,
      dataRequested,
      accessGranted: null,
      accessConditions: null,
      dataDeliveryMethod: null,
      securityClearance: SecurityLevel.INTERNAL,
      complianceNotes: 'Request submitted through portal',
      riskAssessment: {
        riskLevel: 'low',
        dataClassification: 'internal',
        assessedAt: new Date().toISOString()
      },
      businessJustification,
      projectCode,
      contractId,
      costCenter: null,
      ipAddress: ipAddress || '0.0.0.0',
      userAgent,
      sessionId,
      requestMetadata: {
        submissionMethod: 'web_portal',
        submittedAt: new Date().toISOString()
      }
    });
  }

  /**
   * TC-19: Log request approval
   */
  async logRequestApproval(
    requestId: string,
    performedByUserId: string,
    authorizedByUserId?: string,
    previousStatus?: RequestStatus,
    newStatus?: RequestStatus,
    approvalConditions?: any,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ) {
    return this.create({
      requestId,
      actionType: RequestActionType.APPROVE,
      actionStatus: RequestActionStatus.SUCCESS,
      performedByUserId,
      authorizedByUserId,
      delegateUserId: null,
      previousStatus: previousStatus || RequestStatus.pending,
      newStatus: newStatus || RequestStatus.approved,
      statusReason: 'Request approved by authorized user',
      approvalLevel: 1,
      requiredApprovals: 1,
      currentApprovals: 1,
      dataRequested: null,
      accessGranted: approvalConditions?.accessGranted || null,
      accessConditions: approvalConditions || null,
      dataDeliveryMethod: approvalConditions?.deliveryMethod || 'secure_download',
      securityClearance: SecurityLevel.CONFIDENTIAL,
      complianceNotes: 'Request approved with standard conditions',
      riskAssessment: {
        riskLevel: 'assessed',
        approvedDataAccess: true,
        assessedAt: new Date().toISOString()
      },
      businessJustification: null,
      projectCode: null,
      contractId: null,
      costCenter: null,
      ipAddress: ipAddress || '0.0.0.0',
      userAgent,
      sessionId,
      requestMetadata: {
        approvalMethod: 'web_portal',
        approvedAt: new Date().toISOString()
      }
    });
  }

  /**
   * TC-19: Log request rejection
   */
  async logRequestRejection(
    requestId: string,
    performedByUserId: string,
    rejectionReason: string,
    previousStatus?: RequestStatus,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ) {
    return this.create({
      requestId,
      actionType: RequestActionType.REJECT,
      actionStatus: RequestActionStatus.SUCCESS,
      performedByUserId,
      authorizedByUserId: null,
      delegateUserId: null,
      previousStatus: previousStatus || RequestStatus.pending,
      newStatus: RequestStatus.rejected,
      statusReason: rejectionReason,
      approvalLevel: 0,
      requiredApprovals: 1,
      currentApprovals: 0,
      dataRequested: null,
      accessGranted: null,
      accessConditions: null,
      dataDeliveryMethod: null,
      securityClearance: SecurityLevel.INTERNAL,
      complianceNotes: `Request rejected: ${rejectionReason}`,
      riskAssessment: {
        riskLevel: 'rejected',
        rejectionReason: rejectionReason,
        assessedAt: new Date().toISOString()
      },
      businessJustification: null,
      projectCode: null,
      contractId: null,
      costCenter: null,
      ipAddress: ipAddress || '0.0.0.0',
      userAgent,
      sessionId,
      requestMetadata: {
        rejectionMethod: 'web_portal',
        rejectedAt: new Date().toISOString()
      }
    });
  }

  /**
   * TC-19: Log data delivery
   */
  async logDataDelivery(
    requestId: string,
    performedByUserId: string,
    dataDelivered: any,
    deliveryMethod: string,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ) {
    return this.create({
      requestId,
      actionType: RequestActionType.DELIVER,
      actionStatus: RequestActionStatus.SUCCESS,
      performedByUserId,
      authorizedByUserId: null,
      delegateUserId: null,
      previousStatus: RequestStatus.approved,
      newStatus: RequestStatus.delivered,
      statusReason: 'Data delivered to requester',
      approvalLevel: 1,
      requiredApprovals: 1,
      currentApprovals: 1,
      dataRequested: null,
      accessGranted: dataDelivered,
      accessConditions: {
        deliveredAt: new Date().toISOString(),
        deliveryMethod: deliveryMethod
      },
      dataDeliveryMethod: deliveryMethod,
      securityClearance: SecurityLevel.CONFIDENTIAL,
      complianceNotes: 'Data successfully delivered to authorized requester',
      riskAssessment: {
        riskLevel: 'delivered',
        dataTransferred: true,
        assessedAt: new Date().toISOString()
      },
      businessJustification: null,
      projectCode: null,
      contractId: null,
      costCenter: null,
      ipAddress: ipAddress || '0.0.0.0',
      userAgent,
      sessionId,
      requestMetadata: {
        deliveryMethod: deliveryMethod,
        deliveredAt: new Date().toISOString(),
        deliverySize: dataDelivered?.size || 0
      }
    });
  }

  /**
   * Find request audit logs by request ID
   */
  async findByRequestId(requestId: string, limit: number = 50) {
    return prisma.requestActionAuditLog.findMany({
      where: { requestId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        authorizedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        request: {
          select: {
            id: true,
            requestType: true,
            status: true,
            resource: {
              select: { name: true, type: true }
            }
          }
        }
      }
    });
  }

  /**
   * Find request audit logs by user ID
   */
  async findByUserId(userId: string, limit: number = 100) {
    return prisma.requestActionAuditLog.findMany({
      where: {
        OR: [
          { performedByUserId: userId },
          { authorizedByUserId: userId },
          { delegateUserId: userId }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        request: {
          select: {
            id: true,
            requestType: true,
            status: true,
            resource: {
              select: { name: true, type: true }
            }
          }
        }
      }
    });
  }

  /**
   * Get request action statistics for compliance reporting
   */
  async getRequestStatistics(startDate: Date, endDate: Date) {
    const totalActions = await prisma.requestActionAuditLog.count({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const actionsByType = await prisma.requestActionAuditLog.groupBy({
      by: ['actionType'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        actionType: true
      }
    });

    const actionsByStatus = await prisma.requestActionAuditLog.groupBy({
      by: ['actionStatus'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        actionStatus: true
      }
    });

    const securityClearanceDistribution = await prisma.requestActionAuditLog.groupBy({
      by: ['securityClearance'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        securityClearance: true
      }
    });

    return {
      totalActions,
      actionsByType,
      actionsByStatus,
      securityClearanceDistribution,
      period: {
        startDate,
        endDate
      }
    };
  }

  /**
   * TC-20: Verify request action log integrity
   */
  async verifyRequestLogIntegrity(logId: string): Promise<boolean> {
    const log = await prisma.requestActionAuditLog.findUnique({
      where: { id: logId }
    });

    if (!log) return false;

    const { integrityHash, ...logData } = log;
    const expectedHash = this.generateIntegrityHash(logData);

    return expectedHash === integrityHash;
  }

  /**
   * Generate compliance report for request actions
   */
  async generateRequestComplianceReport(startDate: Date, endDate: Date) {
    const statistics = await this.getRequestStatistics(startDate, endDate);

    const requestLogs = await prisma.requestActionAuditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'desc' },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        authorizedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        request: {
          select: {
            id: true,
            requestType: true,
            status: true,
            resource: {
              select: { name: true, type: true }
            }
          }
        }
      }
    });

    return {
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        reportType: 'Request Action Compliance Report',
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        compliance: ['ISO_27001', 'PP_NO_5_2021_MIGAS']
      },
      statistics,
      requestActions: requestLogs.map(log => ({
        id: log.id,
        requestId: log.requestId,
        actionType: log.actionType,
        actionStatus: log.actionStatus,
        performedBy: log.performedBy,
        authorizedBy: log.authorizedBy,
        previousStatus: log.previousStatus,
        newStatus: log.newStatus,
        statusReason: log.statusReason,
        securityClearance: log.securityClearance,
        timestamp: log.timestamp,
        integrityVerified: await this.verifyRequestLogIntegrity(log.id)
      }))
    };
  }

  /**
   * Generate integrity hash for immutable logging
   */
  private generateIntegrityHash(data: any): string {
    const { id, timestamp, integrityHash, ...hashableData } = data;
    const dataString = JSON.stringify(hashableData, Object.keys(hashableData).sort());
    return createHash('sha256').update(dataString).digest('hex');
  }
}