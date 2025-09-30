import { prisma } from '../prisma';
import { AdaptorSyncLog, AdaptorSyncType, SyncStatus } from '@prisma/client';

export class AdaptorSyncLogRepository {
  async findAll() {
    return prisma.adaptorSyncLog.findMany({
      orderBy: { startedAt: 'desc' },
      include: { externalService: true }
    });
  }

  async findById(id: string) {
    return prisma.adaptorSyncLog.findUnique({
      where: { id },
      include: { externalService: true }
    });
  }

  async findByServiceId(externalServiceId: string) {
    return prisma.adaptorSyncLog.findMany({
      where: { externalServiceId },
      orderBy: { startedAt: 'desc' },
      include: { externalService: true }
    });
  }

  async findByStatus(status: SyncStatus) {
    return prisma.adaptorSyncLog.findMany({
      where: { status },
      orderBy: { startedAt: 'desc' },
      include: { externalService: true }
    });
  }

  async create(data: Omit<AdaptorSyncLog, 'id' | 'startedAt'>) {
    return prisma.adaptorSyncLog.create({
      data,
      include: { externalService: true }
    });
  }

  async update(id: string, data: Partial<Omit<AdaptorSyncLog, 'id' | 'startedAt'>>) {
    return prisma.adaptorSyncLog.update({
      where: { id },
      data,
      include: { externalService: true }
    });
  }

  async complete(id: string, recordsProcessed: number, metadata?: any) {
    return prisma.adaptorSyncLog.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        recordsProcessed,
        metadata
      },
      include: { externalService: true }
    });
  }

  async fail(id: string, errors: any) {
    return prisma.adaptorSyncLog.update({
      where: { id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errors
      },
      include: { externalService: true }
    });
  }

  async getRecentSyncsByType(syncType: AdaptorSyncType, limit: number = 10) {
    return prisma.adaptorSyncLog.findMany({
      where: { syncType },
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: { externalService: true }
    });
  }

  async getActiveSyncs() {
    return prisma.adaptorSyncLog.findMany({
      where: { status: 'in_progress' },
      include: { externalService: true }
    });
  }
}