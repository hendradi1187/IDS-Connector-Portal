import { NextRequest, NextResponse } from 'next/server';
import { ExternalServiceRepository, AdaptorSyncLogRepository, AdaptorAuditLogRepository } from '@/lib/database/repositories';
import { AdaptorSyncType } from '@prisma/client';

const externalServiceRepo = new ExternalServiceRepository();
const syncLogRepo = new AdaptorSyncLogRepository();
const auditLogRepo = new AdaptorAuditLogRepository();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { syncType, metadata } = body;

    // Validate service exists and is OGC-OSDU adaptor
    const service = await externalServiceRepo.findById(params.id);
    if (!service) {
      return NextResponse.json(
        { error: 'External service not found' },
        { status: 404 }
      );
    }

    if (service.serviceType !== 'OGC_OSDU_ADAPTOR') {
      return NextResponse.json(
        { error: 'Service is not an OGC-OSDU adaptor' },
        { status: 400 }
      );
    }

    // Check if there's already an active sync
    const activeSyncs = await syncLogRepo.getActiveSyncs();
    const existingSync = activeSyncs.find(sync => sync.externalServiceId === params.id);

    if (existingSync) {
      return NextResponse.json(
        {
          error: 'Sync already in progress',
          syncId: existingSync.id
        },
        { status: 409 }
      );
    }

    // Create sync log
    const syncLog = await syncLogRepo.create({
      externalServiceId: params.id,
      syncType: syncType as AdaptorSyncType,
      status: 'in_progress',
      recordsProcessed: 0,
      metadata
    });

    // Update service status to syncing
    await externalServiceRepo.update(params.id, {
      status: 'syncing',
      lastSync: new Date()
    });

    // Log audit
    await auditLogRepo.logRequest(
      params.id,
      null, // TODO: Get user ID from auth
      'SYNC_START',
      `/adaptor/metadata/sync`,
      'POST',
      { syncType, metadata },
      200,
      0
    );

    // Simulate sync process (replace with actual implementation)
    setTimeout(async () => {
      try {
        // Simulate sync work
        const recordsProcessed = Math.floor(Math.random() * 1000) + 100;

        await syncLogRepo.complete(syncLog.id, recordsProcessed, {
          syncType,
          startTime: syncLog.startedAt,
          endTime: new Date(),
          ...metadata
        });

        await externalServiceRepo.update(params.id, {
          status: 'active'
        });

        await auditLogRepo.logRequest(
          params.id,
          null,
          'SYNC_COMPLETE',
          `/adaptor/metadata/sync`,
          'POST',
          { syncId: syncLog.id, recordsProcessed },
          200,
          5000
        );
      } catch (error) {
        await syncLogRepo.fail(syncLog.id, { error: error?.toString() });
        await externalServiceRepo.update(params.id, { status: 'error' });
      }
    }, 5000);

    return NextResponse.json({
      message: 'Sync started successfully',
      syncId: syncLog.id,
      status: 'in_progress'
    });

  } catch (error) {
    console.error('Error starting sync:', error);
    return NextResponse.json(
      { error: 'Failed to start sync' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const syncLogs = await syncLogRepo.findByServiceId(params.id);
    return NextResponse.json(syncLogs);
  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync logs' },
      { status: 500 }
    );
  }
}