import { prisma } from '../prisma';
import { SystemLog, LogLevel, Prisma } from '@/generated/prisma';

export class SystemLogRepository {
  async findAll(limit: number = 100) {
    return prisma.systemLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });
  }

  async findById(id: string) {
    return prisma.systemLog.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async create(data: Omit<SystemLog, 'id' | 'timestamp'>) {
    return prisma.systemLog.create({
      data: {
        ...data,
        details: data.details as Prisma.InputJsonValue
      },
      include: { user: true }
    });
  }

  async findByService(service: string, limit: number = 100) {
    return prisma.systemLog.findMany({
      where: { service },
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });
  }

  async findByLevel(level: LogLevel, limit: number = 100) {
    return prisma.systemLog.findMany({
      where: { level },
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date, limit: number = 100) {
    return prisma.systemLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });
  }

  async findByUserId(userId: string, limit: number = 100) {
    return prisma.systemLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });
  }

  async getLogStats() {
    const stats = await prisma.systemLog.groupBy({
      by: ['level'],
      _count: {
        level: true
      },
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.level] = stat._count.level;
      return acc;
    }, {} as Record<LogLevel, number>);
  }

  async cleanupOldLogs(olderThanDays: number = 30) {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    return prisma.systemLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });
  }
}