import { prisma } from '../prisma';
import { License, LicenseUsageLog, LicenseStatus, LicenseType, LicenseLevel, LicenseUsageType, UsageStatus } from '@prisma/client';
import { createHash, createHmac } from 'crypto';

export class LicenseRepository {

  /**
   * Activate license with token
   */
  async activateLicense(licenseToken: string, activationKey?: string, clientFingerprint?: string) {
    // Verify license token format and validity
    if (!this.validateLicenseTokenFormat(licenseToken)) {
      throw new Error('Invalid license token format');
    }

    // Find license by token
    const license = await prisma.license.findUnique({
      where: { licenseToken }
    });

    if (!license) {
      throw new Error('License not found');
    }

    // Check if already active
    if (license.status === LicenseStatus.ACTIVE && license.isActive) {
      return license;
    }

    // Check expiration
    if (new Date() > license.expirationDate) {
      await this.updateLicenseStatus(license.id, LicenseStatus.EXPIRED);
      throw new Error('License has expired');
    }

    // Verify activation key if provided
    if (activationKey && license.activationKey) {
      const expectedKey = this.generateActivationKey(license.licenseToken, license.organizationId || '');
      if (activationKey !== expectedKey) {
        throw new Error('Invalid activation key');
      }
    }

    // Update license status
    const updatedLicense = await prisma.license.update({
      where: { id: license.id },
      data: {
        status: LicenseStatus.ACTIVE,
        isActive: true,
        activationDate: new Date(),
        clientFingerprint,
        lastUsed: new Date(),
        usageCount: { increment: 1 }
      }
    });

    return updatedLicense;
  }

  /**
   * Validate license and check feature access
   */
  async validateLicense(licenseToken: string, featureName?: string): Promise<{
    isValid: boolean;
    license?: License;
    hasFeatureAccess: boolean;
    error?: string;
  }> {
    try {
      const license = await prisma.license.findUnique({
        where: { licenseToken }
      });

      if (!license) {
        return { isValid: false, hasFeatureAccess: false, error: 'License not found' };
      }

      // Check if license is active
      if (!license.isActive || license.status !== LicenseStatus.ACTIVE) {
        return { isValid: false, hasFeatureAccess: false, error: 'License is not active' };
      }

      // Check expiration
      if (new Date() > license.expirationDate) {
        // Auto-expire the license
        await this.updateLicenseStatus(license.id, LicenseStatus.EXPIRED);
        return { isValid: false, hasFeatureAccess: false, error: 'License has expired' };
      }

      // Check feature access if specified
      let hasFeatureAccess = true;
      if (featureName) {
        hasFeatureAccess = this.checkFeatureAccess(license, featureName);
      }

      // Update last used
      await prisma.license.update({
        where: { id: license.id },
        data: {
          lastUsed: new Date(),
          usageCount: { increment: 1 }
        }
      });

      return {
        isValid: true,
        license,
        hasFeatureAccess,
        error: hasFeatureAccess ? undefined : `Feature '${featureName}' is not enabled in this license`
      };

    } catch (error) {
      return {
        isValid: false,
        hasFeatureAccess: false,
        error: `License validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get current active license
   */
  async getCurrentLicense() {
    const license = await prisma.license.findFirst({
      where: {
        status: LicenseStatus.ACTIVE,
        isActive: true,
        expirationDate: {
          gt: new Date()
        }
      },
      orderBy: { expirationDate: 'desc' }
    });

    return license;
  }

  /**
   * Create new license (for admin/system use)
   */
  async createLicense(data: {
    licenseName: string;
    licenseType: LicenseType;
    licenseLevel: LicenseLevel;
    organizationName: string;
    organizationId?: string;
    contactEmail: string;
    expirationDate: Date;
    maxUsers?: number;
    maxConnectors?: number;
    maxDataVolume?: bigint;
    maxAPIRequests?: number;
    enabledFeatures: string[];
    restrictedFeatures?: string[];
    metadata?: any;
  }) {
    // Generate unique license token
    const licenseToken = this.generateLicenseToken(data);
    const licenseHash = this.generateLicenseHash(licenseToken);
    const activationKey = this.generateActivationKey(licenseToken, data.organizationId || '');

    const license = await prisma.license.create({
      data: {
        licenseToken,
        licenseHash,
        licenseName: data.licenseName,
        licenseType: data.licenseType,
        licenseLevel: data.licenseLevel,
        issuedDate: new Date(),
        expirationDate: data.expirationDate,
        organizationName: data.organizationName,
        organizationId: data.organizationId,
        contactEmail: data.contactEmail,
        maxUsers: data.maxUsers,
        maxConnectors: data.maxConnectors,
        maxDataVolume: data.maxDataVolume,
        maxAPIRequests: data.maxAPIRequests,
        enabledFeatures: data.enabledFeatures,
        restrictedFeatures: data.restrictedFeatures || [],
        activationKey,
        metadata: data.metadata,
        status: LicenseStatus.INACTIVE
      }
    });

    return license;
  }

  /**
   * Log feature usage
   */
  async logFeatureUsage(
    licenseToken: string,
    featureName: string,
    usageType: LicenseUsageType,
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    metrics?: {
      dataProcessed?: bigint;
      apiCalls?: number;
      processingTime?: number;
    }
  ) {
    const license = await prisma.license.findUnique({
      where: { licenseToken }
    });

    if (!license) {
      throw new Error('License not found');
    }

    // Check if feature is enabled
    if (!this.checkFeatureAccess(license, featureName)) {
      const usageLog = await prisma.licenseUsageLog.create({
        data: {
          licenseId: license.id,
          featureUsed: featureName,
          usageType,
          userId,
          sessionId,
          ipAddress,
          userAgent,
          usageStatus: UsageStatus.FEATURE_RESTRICTED,
          errorMessage: `Feature '${featureName}' is not enabled in this license`,
          startTime: new Date(),
          endTime: new Date()
        }
      });

      throw new Error(`Feature '${featureName}' is not enabled in this license`);
    }

    // Create usage log
    const usageLog = await prisma.licenseUsageLog.create({
      data: {
        licenseId: license.id,
        featureUsed: featureName,
        usageType,
        userId,
        sessionId,
        ipAddress,
        userAgent,
        dataProcessed: metrics?.dataProcessed,
        apiCalls: metrics?.apiCalls,
        processingTime: metrics?.processingTime,
        usageStatus: UsageStatus.SUCCESS,
        startTime: new Date()
      }
    });

    return usageLog;
  }

  /**
   * Get license usage statistics
   */
  async getLicenseUsageStats(licenseId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = { licenseId };

    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: startDate,
        lte: endDate
      };
    }

    const totalUsage = await prisma.licenseUsageLog.count({
      where: whereClause
    });

    const usageByFeature = await prisma.licenseUsageLog.groupBy({
      by: ['featureUsed'],
      where: whereClause,
      _count: {
        featureUsed: true
      }
    });

    const usageByStatus = await prisma.licenseUsageLog.groupBy({
      by: ['usageStatus'],
      where: whereClause,
      _count: {
        usageStatus: true
      }
    });

    const dataProcessed = await prisma.licenseUsageLog.aggregate({
      where: {
        ...whereClause,
        dataProcessed: { not: null }
      },
      _sum: {
        dataProcessed: true
      }
    });

    const apiCalls = await prisma.licenseUsageLog.aggregate({
      where: {
        ...whereClause,
        apiCalls: { not: null }
      },
      _sum: {
        apiCalls: true
      }
    });

    return {
      totalUsage,
      usageByFeature,
      usageByStatus,
      totalDataProcessed: dataProcessed._sum.dataProcessed || 0n,
      totalApiCalls: apiCalls._sum.apiCalls || 0,
      period: startDate && endDate ? { startDate, endDate } : null
    };
  }

  /**
   * Check if license limits are exceeded
   */
  async checkLicenseLimits(licenseToken: string): Promise<{
    isValid: boolean;
    limits: {
      users?: { current: number; max: number; exceeded: boolean };
      connectors?: { current: number; max: number; exceeded: boolean };
      dataVolume?: { current: bigint; max: bigint; exceeded: boolean };
      apiRequests?: { current: number; max: number; exceeded: boolean };
    };
  }> {
    const license = await prisma.license.findUnique({
      where: { licenseToken }
    });

    if (!license) {
      return { isValid: false, limits: {} };
    }

    const limits: any = {};
    let isValid = true;

    // Check user limit
    try {
      if (license.maxUsers) {
        const currentUsers = await prisma.user.count();
        limits.users = {
          current: currentUsers,
          max: license.maxUsers,
          exceeded: currentUsers > license.maxUsers
        };
        if (limits.users.exceeded) isValid = false;
      }
    } catch (error) {
      console.error('Error checking user limit:', error);
    }

    // Check connector limit
    try {
      if (license.maxConnectors) {
        const currentConnectors = await prisma.externalService.count();
        limits.connectors = {
          current: currentConnectors,
          max: license.maxConnectors,
          exceeded: currentConnectors > license.maxConnectors
        };
        if (limits.connectors.exceeded) isValid = false;
      }
    } catch (error) {
      console.error('Error checking connector limit:', error);
    }

    // Check data volume (last 30 days)
    try {
      if (license.maxDataVolume) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dataUsage = await prisma.licenseUsageLog.aggregate({
          where: {
            licenseId: license.id,
            timestamp: { gte: thirtyDaysAgo },
            dataProcessed: { not: null }
          },
          _sum: { dataProcessed: true }
        });

        const currentDataVolume = dataUsage._sum.dataProcessed || 0n;
        limits.dataVolume = {
          current: currentDataVolume,
          max: license.maxDataVolume,
          exceeded: currentDataVolume > license.maxDataVolume
        };
        if (limits.dataVolume.exceeded) isValid = false;
      }
    } catch (error) {
      console.error('Error checking data volume limit:', error);
    }

    // Check API requests (daily)
    try {
      if (license.maxAPIRequests) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const apiUsage = await prisma.licenseUsageLog.aggregate({
          where: {
            licenseId: license.id,
            timestamp: { gte: today },
            usageType: LicenseUsageType.API_CALL
          },
          _sum: { apiCalls: true }
        });

        const currentApiRequests = apiUsage._sum.apiCalls || 0;
        limits.apiRequests = {
          current: currentApiRequests,
          max: license.maxAPIRequests,
          exceeded: currentApiRequests > license.maxAPIRequests
        };
        if (limits.apiRequests.exceeded) isValid = false;
      }
    } catch (error) {
      console.error('Error checking API request limit:', error);
    }

    return { isValid, limits };
  }

  /**
   * Update license status
   */
  private async updateLicenseStatus(licenseId: string, status: LicenseStatus) {
    return prisma.license.update({
      where: { id: licenseId },
      data: {
        status,
        isActive: status === LicenseStatus.ACTIVE
      }
    });
  }

  /**
   * Check if license has access to specific feature
   */
  private checkFeatureAccess(license: License, featureName: string): boolean {
    // If feature is in restricted list, deny access
    if (license.restrictedFeatures.includes(featureName)) {
      return false;
    }

    // If enabled features is empty, allow all features
    if (license.enabledFeatures.length === 0) {
      return true;
    }

    // Check if feature is in enabled list
    return license.enabledFeatures.includes(featureName) || license.enabledFeatures.includes('*');
  }

  /**
   * Validate license token format
   */
  private validateLicenseTokenFormat(token: string): boolean {
    // Expected format: IDS-XXXX-XXXX-XXXX-XXXX
    const regex = /^IDS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return regex.test(token);
  }

  /**
   * Generate license token
   */
  private generateLicenseToken(data: any): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orgHash = createHash('md5').update(data.organizationName).digest('hex').substring(0, 4).toUpperCase();
    const typeHash = createHash('md5').update(data.licenseType).digest('hex').substring(0, 4).toUpperCase();

    return `IDS-${timestamp.substring(0, 4)}-${random}-${orgHash}-${typeHash}`;
  }

  /**
   * Generate license hash
   */
  private generateLicenseHash(licenseToken: string): string {
    const secret = process.env.LICENSE_SECRET || 'default-license-secret';
    return createHmac('sha256', secret).update(licenseToken).digest('hex');
  }

  /**
   * Generate activation key
   */
  private generateActivationKey(licenseToken: string, organizationId: string): string {
    const combined = `${licenseToken}-${organizationId}`;
    return createHash('sha256').update(combined).digest('hex').substring(0, 32).toUpperCase();
  }

  /**
   * Get all licenses (admin function)
   */
  async getAllLicenses(includeInactive: boolean = false) {
    const whereClause: any = {};

    if (!includeInactive) {
      whereClause.status = { in: [LicenseStatus.ACTIVE, LicenseStatus.PENDING_ACTIVATION] };
    }

    return prisma.license.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        usageLogs: {
          take: 5,
          orderBy: { timestamp: 'desc' }
        }
      }
    });
  }
}