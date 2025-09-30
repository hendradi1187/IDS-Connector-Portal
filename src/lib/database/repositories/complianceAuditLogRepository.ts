import { prisma } from '../prisma';
import { ComplianceAuditLog, AuditEventType, DataClassification, SecurityLevel } from '@prisma/client';
import { createHash } from 'crypto';

export class ComplianceAuditLogRepository {

  /**
   * Create an immutable audit log entry with integrity hash
   * TC-20: Ensure log immutability
   */
  async create(data: Omit<ComplianceAuditLog, 'id' | 'timestamp' | 'createdAt' | 'integrityHash'>) {
    // Generate integrity hash for immutability
    const integrityHash = this.generateIntegrityHash(data);

    const auditLog = await prisma.complianceAuditLog.create({
      data: {
        ...data,
        integrityHash,
        timestamp: new Date(),
        createdAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        resource: {
          select: { id: true, name: true, type: true, providerId: true }
        },
        contract: {
          select: { id: true, title: true, status: true, contractType: true }
        }
      }
    });

    return auditLog;
  }

  /**
   * TC-18: Log upload resource actions
   */
  async logResourceUpload(
    userId: string,
    resourceId: string,
    fileName: string,
    fileSize: bigint,
    fileHash: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.create({
      eventType: AuditEventType.RESOURCE_UPLOAD,
      action: 'RESOURCE_UPLOAD',
      entityType: 'Resource',
      entityId: resourceId,
      userId,
      sessionId,
      ipAddress,
      userAgent,
      resourceId,
      fileName,
      fileSize,
      fileHash,
      securityLevel: SecurityLevel.CONFIDENTIAL,
      dataClassification: DataClassification.CONFIDENTIAL,
      complianceFlags: ['ISO_27001', 'PP_NO_5_2021_MIGAS'],
      metadata: {
        uploadedAt: new Date().toISOString(),
        virusScanned: false,
        encrypted: true,
        action: 'file_upload',
        source: 'web_interface'
      }
    });
  }

  /**
   * TC-19: Log request actions
   */
  async logRequestAction(
    userId: string,
    requestId: string,
    action: string,
    previousState: any,
    currentState: any,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    contractId?: string
  ) {
    return this.create({
      eventType: this.mapActionToEventType(action),
      action,
      entityType: 'Request',
      entityId: requestId,
      userId,
      sessionId,
      ipAddress,
      userAgent,
      contractId,
      previousState,
      currentState,
      changeReason: `User ${action} request`,
      securityLevel: SecurityLevel.INTERNAL,
      dataClassification: DataClassification.INTERNAL,
      complianceFlags: ['ISO_27001', 'PP_NO_5_2021_MIGAS'],
      metadata: {
        actionPerformedAt: new Date().toISOString(),
        workflowStep: action,
        source: 'portal'
      }
    });
  }

  /**
   * Log security incidents for compliance
   */
  async logSecurityIncident(
    eventType: AuditEventType,
    action: string,
    userId: string | null,
    details: any,
    riskScore: number,
    ipAddress?: string
  ) {
    return this.create({
      eventType,
      action,
      entityType: 'Security',
      entityId: null,
      userId,
      ipAddress,
      securityLevel: SecurityLevel.SECRET,
      dataClassification: DataClassification.RESTRICTED,
      riskScore,
      complianceFlags: ['SECURITY_INCIDENT', 'ISO_27001', 'PP_NO_5_2021_MIGAS'],
      errorDetails: details,
      metadata: {
        incidentType: 'security_violation',
        severity: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
        reportedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Find audit logs with filters for compliance reporting
   */
  async findWithFilters({
    eventType,
    userId,
    entityType,
    securityLevel,
    startDate,
    endDate,
    complianceFlag,
    limit = 100,
    offset = 0
  }: {
    eventType?: AuditEventType;
    userId?: string;
    entityType?: string;
    securityLevel?: SecurityLevel;
    startDate?: Date;
    endDate?: Date;
    complianceFlag?: string;
    limit?: number;
    offset?: number;
  }) {
    return prisma.complianceAuditLog.findMany({
      where: {
        ...(eventType && { eventType }),
        ...(userId && { userId }),
        ...(entityType && { entityType }),
        ...(securityLevel && { securityLevel }),
        ...(startDate && endDate && {
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        }),
        ...(complianceFlag && {
          complianceFlags: {
            has: complianceFlag
          }
        })
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        resource: {
          select: { id: true, name: true, type: true }
        },
        contract: {
          select: { id: true, title: true, status: true }
        }
      }
    });
  }

  /**
   * Get audit statistics for compliance reporting
   */
  async getComplianceStatistics(startDate: Date, endDate: Date) {
    const stats = await prisma.complianceAuditLog.aggregateRaw([
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          eventsByType: {
            $push: {
              type: "$event_type",
              count: 1
            }
          },
          securityIncidents: {
            $sum: {
              $cond: [
                { $in: ["SECURITY_INCIDENT", "$compliance_flags"] },
                1,
                0
              ]
            }
          },
          avgRiskScore: { $avg: "$risk_score" },
          highRiskEvents: {
            $sum: {
              $cond: [{ $gt: ["$risk_score", 70] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats;
  }

  /**
   * Verify log integrity - TC-20: Check log immutability
   */
  async verifyLogIntegrity(logId: string): Promise<boolean> {
    const log = await prisma.complianceAuditLog.findUnique({
      where: { id: logId }
    });

    if (!log) return false;

    // Recreate hash and compare
    const { integrityHash, ...logData } = log;
    const expectedHash = this.generateIntegrityHash(logData);

    return expectedHash === integrityHash;
  }

  /**
   * Generate integrity hash for immutable logging
   */
  private generateIntegrityHash(data: any): string {
    // Remove dynamic fields that shouldn't affect integrity
    const { id, timestamp, createdAt, integrityHash, ...hashableData } = data;

    // Create deterministic string from data
    const dataString = JSON.stringify(hashableData, Object.keys(hashableData).sort());

    // Generate SHA-256 hash
    return createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Map action strings to event types
   */
  private mapActionToEventType(action: string): AuditEventType {
    const actionMap: { [key: string]: AuditEventType } = {
      'submit': AuditEventType.REQUEST_SUBMITTED,
      'approve': AuditEventType.REQUEST_APPROVED,
      'reject': AuditEventType.REQUEST_REJECTED,
      'deliver': AuditEventType.REQUEST_DELIVERED,
      'upload': AuditEventType.RESOURCE_UPLOAD,
      'download': AuditEventType.RESOURCE_DOWNLOAD,
      'access': AuditEventType.RESOURCE_ACCESS,
      'modify': AuditEventType.RESOURCE_MODIFICATION,
      'delete': AuditEventType.RESOURCE_DELETION,
      'login': AuditEventType.USER_LOGIN,
      'logout': AuditEventType.USER_LOGOUT
    };

    return actionMap[action.toLowerCase()] || AuditEventType.SYSTEM_CONFIGURATION;
  }

  /**
   * Export compliance report in required format
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    format: 'ISO_27001' | 'PP_NO_5_2021' = 'ISO_27001'
  ) {
    const logs = await this.findWithFilters({
      startDate,
      endDate,
      complianceFlag: format === 'ISO_27001' ? 'ISO_27001' : 'PP_NO_5_2021_MIGAS',
      limit: 10000
    });

    const stats = await this.getComplianceStatistics(startDate, endDate);

    const auditLogs = await Promise.all(logs.map(async (log) => ({
      id: log.id,
      timestamp: log.timestamp,
      eventType: log.eventType,
      action: log.action,
      user: log.user ? {
        id: log.user.id,
        name: log.user.name,
        role: log.user.role
      } : null,
      entityType: log.entityType,
      entityId: log.entityId,
      securityLevel: log.securityLevel,
      dataClassification: log.dataClassification,
      riskScore: log.riskScore,
      integrityVerified: await this.verifyLogIntegrity(log.id)
    })));

    return {
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        format,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        compliance: format === 'ISO_27001'
          ? 'ISO/IEC 27001:2013 Information Security Management'
          : 'PP No. 5/2021 tentang Pengelolaan Data Migas'
      },
      summary: stats,
      auditLogs
    };
  }
}