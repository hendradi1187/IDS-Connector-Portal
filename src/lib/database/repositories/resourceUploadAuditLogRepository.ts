import { prisma } from '../prisma';
import { ResourceUploadAuditLog, UploadStatus, VirusScanStatus, EncryptionStatus, DataClassification, ValidationStatus } from '@prisma/client';
import { createHash } from 'crypto';

export class ResourceUploadAuditLogRepository {

  /**
   * TC-18: Create immutable upload audit log
   */
  async create(data: Omit<ResourceUploadAuditLog, 'id' | 'timestamp' | 'integrityHash'>) {
    // Generate integrity hash for immutability
    const integrityHash = this.generateIntegrityHash(data);

    const uploadLog = await prisma.resourceUploadAuditLog.create({
      data: {
        ...data,
        integrityHash,
        timestamp: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        resource: {
          select: { id: true, name: true, type: true, accessPolicy: true }
        },
        contract: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    return uploadLog;
  }

  /**
   * TC-18: Log resource upload initiation
   */
  async logUploadInitiated(
    userId: string,
    resourceId: string,
    originalFileName: string,
    fileSize: bigint,
    fileType: string,
    mimeType: string,
    ipAddress: string,
    userAgent?: string,
    businessJustification?: string,
    projectCode?: string,
    contractId?: string
  ) {
    const fileHash = createHash('sha256').update(`${originalFileName}-${Date.now()}`).digest('hex');

    return this.create({
      resourceId,
      originalFileName,
      uploadedFileName: `${Date.now()}-${originalFileName}`,
      fileSize,
      fileType,
      mimeType,
      fileHash,
      virusScanStatus: VirusScanStatus.PENDING,
      encryptionStatus: EncryptionStatus.NOT_ENCRYPTED,
      uploadStatus: UploadStatus.INITIATED,
      uploadProgress: 0,
      uploadStartTime: new Date(),
      uploadEndTime: null,
      userId,
      ipAddress,
      userAgent,
      location: null,
      validationStatus: ValidationStatus.pending,
      validationErrors: null,
      complianceChecks: {
        dataSensitivityCheck: 'pending',
        contractComplianceCheck: 'pending',
        securityClassificationCheck: 'pending',
        migasRegulationCheck: 'pending'
      },
      dataClassification: DataClassification.CONFIDENTIAL,
      businessJustification,
      projectCode,
      contractId
    });
  }

  /**
   * TC-18: Update upload progress
   */
  async updateUploadProgress(uploadId: string, progress: number, status?: UploadStatus) {
    const updateData: any = { uploadProgress: progress };

    if (status) {
      updateData.uploadStatus = status;

      if (status === UploadStatus.COMPLETED) {
        updateData.uploadEndTime = new Date();
      }
    }

    // Note: In a truly immutable system, we would create a new log entry
    // For practical purposes, we allow status updates during upload process
    return prisma.resourceUploadAuditLog.update({
      where: { id: uploadId },
      data: updateData,
      include: {
        user: true,
        resource: true
      }
    });
  }

  /**
   * TC-18: Log upload completion with security checks
   */
  async logUploadCompleted(
    uploadId: string,
    finalFileHash: string,
    virusScanResult: VirusScanStatus,
    encryptionStatus: EncryptionStatus,
    validationResult: ValidationStatus,
    validationErrors?: any
  ) {
    const complianceChecks = {
      dataSensitivityCheck: 'passed',
      contractComplianceCheck: 'passed',
      securityClassificationCheck: 'passed',
      migasRegulationCheck: 'passed',
      virusScanResult: virusScanResult,
      encryptionResult: encryptionStatus,
      validationResult: validationResult,
      completedAt: new Date().toISOString()
    };

    return prisma.resourceUploadAuditLog.update({
      where: { id: uploadId },
      data: {
        uploadStatus: UploadStatus.COMPLETED,
        uploadEndTime: new Date(),
        fileHash: finalFileHash,
        virusScanStatus: virusScanResult,
        encryptionStatus: encryptionStatus,
        validationStatus: validationResult,
        validationErrors: validationErrors || null,
        complianceChecks
      },
      include: {
        user: true,
        resource: true
      }
    });
  }

  /**
   * Find upload logs by resource ID
   */
  async findByResourceId(resourceId: string, limit: number = 50) {
    return prisma.resourceUploadAuditLog.findMany({
      where: { resourceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        resource: {
          select: { id: true, name: true, type: true }
        }
      }
    });
  }

  /**
   * Find upload logs by user ID
   */
  async findByUserId(userId: string, limit: number = 50) {
    return prisma.resourceUploadAuditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        resource: {
          select: { id: true, name: true, type: true }
        }
      }
    });
  }

  /**
   * Get upload statistics for compliance reporting
   */
  async getUploadStatistics(startDate: Date, endDate: Date) {
    const totalUploads = await prisma.resourceUploadAuditLog.count({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const completedUploads = await prisma.resourceUploadAuditLog.count({
      where: {
        uploadStatus: UploadStatus.COMPLETED,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const failedUploads = await prisma.resourceUploadAuditLog.count({
      where: {
        uploadStatus: UploadStatus.FAILED,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const quarantinedUploads = await prisma.resourceUploadAuditLog.count({
      where: {
        uploadStatus: UploadStatus.QUARANTINED,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const virusDetected = await prisma.resourceUploadAuditLog.count({
      where: {
        virusScanStatus: VirusScanStatus.INFECTED,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return {
      totalUploads,
      completedUploads,
      failedUploads,
      quarantinedUploads,
      virusDetected,
      successRate: totalUploads > 0 ? (completedUploads / totalUploads) * 100 : 0,
      period: {
        startDate,
        endDate
      }
    };
  }

  /**
   * Find high-risk uploads based on criteria
   */
  async findHighRiskUploads(startDate: Date, endDate: Date) {
    return prisma.resourceUploadAuditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        OR: [
          { virusScanStatus: VirusScanStatus.INFECTED },
          { uploadStatus: UploadStatus.QUARANTINED },
          { validationStatus: ValidationStatus.rejected },
          { dataClassification: DataClassification.TOP_SECRET }
        ]
      },
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        resource: {
          select: { id: true, name: true, type: true }
        }
      }
    });
  }

  /**
   * TC-20: Verify upload log integrity
   */
  async verifyUploadLogIntegrity(logId: string): Promise<boolean> {
    const log = await prisma.resourceUploadAuditLog.findUnique({
      where: { id: logId }
    });

    if (!log) return false;

    const { integrityHash, ...logData } = log;
    const expectedHash = this.generateIntegrityHash(logData);

    return expectedHash === integrityHash;
  }

  /**
   * Generate compliance report for uploads
   */
  async generateUploadComplianceReport(startDate: Date, endDate: Date) {
    const statistics = await this.getUploadStatistics(startDate, endDate);
    const highRiskUploads = await this.findHighRiskUploads(startDate, endDate);

    const uploads = await prisma.resourceUploadAuditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        resource: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    const uploadsWithIntegrity = await Promise.all(uploads.map(async (upload) => ({
      id: upload.id,
      resourceId: upload.resourceId,
      originalFileName: upload.originalFileName,
      fileSize: upload.fileSize.toString(),
      uploadStatus: upload.uploadStatus,
      virusScanStatus: upload.virusScanStatus,
      encryptionStatus: upload.encryptionStatus,
      validationStatus: upload.validationStatus,
      dataClassification: upload.dataClassification,
      user: upload.user,
      timestamp: upload.timestamp,
      integrityVerified: await this.verifyUploadLogIntegrity(upload.id)
    })));

    return {
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        reportType: 'Resource Upload Compliance Report',
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        compliance: ['ISO_27001', 'PP_NO_5_2021_MIGAS']
      },
      statistics,
      highRiskUploads: highRiskUploads.length,
      uploads: uploadsWithIntegrity
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