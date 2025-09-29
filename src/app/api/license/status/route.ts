import { NextRequest, NextResponse } from 'next/server';
import { LicenseRepository } from '@/lib/database/repositories';

const licenseRepo = new LicenseRepository();

export async function GET(request: NextRequest) {
  try {
    // Get current active license
    const license = await licenseRepo.getCurrentLicense();

    if (!license) {
      return NextResponse.json({
        success: true,
        hasActiveLicense: false,
        message: 'No active license found'
      });
    }

    // Get license limits and usage
    const limitsCheck = await licenseRepo.checkLicenseLimits(license.licenseToken);

    // Get usage statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usageStats = await licenseRepo.getLicenseUsageStats(
      license.id,
      thirtyDaysAgo,
      new Date()
    );

    // Calculate days until expiration
    const now = new Date();
    const expirationDate = new Date(license.expirationDate);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      success: true,
      hasActiveLicense: true,
      license: {
        id: license.id,
        licenseName: license.licenseName,
        licenseType: license.licenseType,
        licenseLevel: license.licenseLevel,
        status: license.status,
        isActive: license.isActive,
        organizationName: license.organizationName,
        contactEmail: license.contactEmail,
        activationDate: license.activationDate,
        expirationDate: license.expirationDate,
        daysUntilExpiration,
        isExpiringSoon: daysUntilExpiration <= 30 && daysUntilExpiration > 0,
        isExpired: daysUntilExpiration <= 0,
        lastUsed: license.lastUsed,
        usageCount: license.usageCount,
        enabledFeatures: license.enabledFeatures,
        restrictedFeatures: license.restrictedFeatures,
        maxUsers: license.maxUsers,
        maxConnectors: license.maxConnectors,
        maxDataVolume: license.maxDataVolume?.toString(),
        maxAPIRequests: license.maxAPIRequests
      },
      limits: limitsCheck.limits,
      limitsExceeded: !limitsCheck.isValid,
      usage: {
        totalUsage: usageStats.totalUsage,
        usageByFeature: usageStats.usageByFeature,
        usageByStatus: usageStats.usageByStatus,
        totalDataProcessed: usageStats.totalDataProcessed.toString(),
        totalApiCalls: usageStats.totalApiCalls,
        period: usageStats.period
      }
    });

  } catch (error) {
    console.error('Error getting license status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get license status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}