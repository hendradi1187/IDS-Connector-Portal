import { prisma } from '../prisma';
import { ProcessingLog, ProcessingStatus, Prisma } from '@prisma/client';

export class ProcessingLogRepository {
  async findAll() {
    return prisma.processingLog.findMany({
      orderBy: { startTime: 'desc' },
      include: { resource: true, request: true }
    });
  }

  async findById(id: string) {
    return prisma.processingLog.findUnique({
      where: { id },
      include: { resource: true, request: true }
    });
  }

  async create(data: Omit<ProcessingLog, 'id'>) {
    return prisma.processingLog.create({
      data: {
        ...data,
        details: data.details as Prisma.InputJsonValue
      },
      include: { resource: true, request: true }
    });
  }

  async update(id: string, data: Partial<Omit<ProcessingLog, 'id'>>) {
    const updateData: any = { ...data };
    if (updateData.details) {
      updateData.details = updateData.details as Prisma.InputJsonValue;
    }

    return prisma.processingLog.update({
      where: { id },
      data: updateData,
      include: { resource: true, request: true }
    });
  }

  async delete(id: string) {
    return prisma.processingLog.delete({
      where: { id }
    });
  }

  async findByProcessType(processType: string) {
    return prisma.processingLog.findMany({
      where: { processType },
      orderBy: { startTime: 'desc' },
      include: { resource: true, request: true }
    });
  }

  async findByStatus(status: ProcessingStatus) {
    return prisma.processingLog.findMany({
      where: { status },
      orderBy: { startTime: 'desc' },
      include: { resource: true, request: true }
    });
  }

  async findByResourceId(resourceId: string) {
    return prisma.processingLog.findMany({
      where: { resourceId },
      orderBy: { startTime: 'desc' },
      include: { resource: true, request: true }
    });
  }

  async findByRequestId(requestId: string) {
    return prisma.processingLog.findMany({
      where: { requestId },
      orderBy: { startTime: 'desc' },
      include: { resource: true, request: true }
    });
  }

  async updateProgress(id: string, progress: number) {
    return prisma.processingLog.update({
      where: { id },
      data: { progress },
      include: { resource: true, request: true }
    });
  }

  async completeProcessing(id: string, success: boolean, errorMessage?: string) {
    const endTime = new Date();

    return prisma.processingLog.update({
      where: { id },
      data: {
        status: success ? 'completed' : 'failed',
        endTime,
        progress: success ? 100 : undefined,
        errorMessage: errorMessage || undefined,
        duration: undefined // Will be calculated in the update
      },
      include: { resource: true, request: true }
    }).then(async (log) => {
      // Calculate duration
      if (log.startTime && endTime) {
        const duration = Math.floor((endTime.getTime() - log.startTime.getTime()) / 1000);
        return prisma.processingLog.update({
          where: { id },
          data: { duration },
          include: { resource: true, request: true }
        });
      }
      return log;
    });
  }

  async getProcessingStats() {
    const stats = await prisma.processingLog.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: {
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<ProcessingStatus, number>);
  }

  async getAverageProcessingTime() {
    const result = await prisma.processingLog.aggregate({
      _avg: {
        duration: true
      },
      where: {
        status: 'completed',
        duration: { not: null }
      }
    });

    return result._avg.duration || 0;
  }
}