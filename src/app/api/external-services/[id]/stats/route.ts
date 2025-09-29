import { NextRequest, NextResponse } from 'next/server';
import { AdaptorAuditLogRepository, AdaptorSyncLogRepository, ExternalServiceRepository } from '@/lib/database/repositories';

const auditLogRepo = new AdaptorAuditLogRepository();
const syncLogRepo = new AdaptorSyncLogRepository();
const externalServiceRepo = new ExternalServiceRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Verify service exists
    const service = await externalServiceRepo.findById(params.id);
    if (!service) {
      return NextResponse.json(
        { error: 'External service not found' },
        { status: 404 }
      );
    }

    // Get audit statistics
    const auditStats = await auditLogRepo.getAuditStats(params.id, days);

    // Get sync statistics
    const since = new Date();
    since.setDate(since.getDate() - days);

    const recentSyncs = await syncLogRepo.findByServiceId(params.id);
    const syncsInPeriod = recentSyncs.filter(sync =>
      new Date(sync.startedAt) >= since
    );

    const totalSyncs = syncsInPeriod.length;
    const completedSyncs = syncsInPeriod.filter(sync => sync.status === 'completed').length;
    const failedSyncs = syncsInPeriod.filter(sync => sync.status === 'failed').length;
    const totalRecordsProcessed = syncsInPeriod
      .filter(sync => sync.status === 'completed')
      .reduce((sum, sync) => sum + sync.recordsProcessed, 0);

    const lastSync = recentSyncs[0];
    const activeSyncs = await syncLogRepo.getActiveSyncs();
    const isCurrentlySyncing = activeSyncs.some(sync => sync.externalServiceId === params.id);

    const stats = {
      service: {
        id: service.id,
        name: service.name,
        status: service.status,
        lastSync: service.lastSync,
        isCurrentlySyncing
      },
      audit: auditStats,
      sync: {
        totalSyncs,
        completedSyncs,
        failedSyncs,
        totalRecordsProcessed,
        successRate: totalSyncs > 0 ? (completedSyncs / totalSyncs) * 100 : 0,
        lastSync: lastSync ? {
          id: lastSync.id,
          status: lastSync.status,
          startedAt: lastSync.startedAt,
          completedAt: lastSync.completedAt,
          recordsProcessed: lastSync.recordsProcessed,
          syncType: lastSync.syncType
        } : null
      },
      period: {
        days,
        startDate: since,
        endDate: new Date()
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching service stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service statistics' },
      { status: 500 }
    );
  }
}