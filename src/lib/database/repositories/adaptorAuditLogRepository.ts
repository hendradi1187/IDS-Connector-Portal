import { prisma } from '../prisma';
import { AdaptorAuditLog } from '@prisma/client';

export class AdaptorAuditLogRepository {
  async findAll(limit: number = 100) {
    return prisma.adaptorAuditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { externalService: true, user: true }
    });
  }

  async findById(id: string) {
    return prisma.adaptorAuditLog.findUnique({
      where: { id },
      include: { externalService: true, user: true }
    });
  }

  async findByServiceId(externalServiceId: string, limit: number = 50) {
    return prisma.adaptorAuditLog.findMany({
      where: { externalServiceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { externalService: true, user: true }
    });
  }

  async findByUserId(userId: string, limit: number = 50) {
    return prisma.adaptorAuditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { externalService: true, user: true }
    });
  }

  async findByAction(action: string, limit: number = 50) {
    return prisma.adaptorAuditLog.findMany({
      where: { action },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { externalService: true, user: true }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return prisma.adaptorAuditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'desc' },
      include: { externalService: true, user: true }
    });
  }

  async create(data: Omit<AdaptorAuditLog, 'id' | 'timestamp'>) {
    return prisma.adaptorAuditLog.create({
      data,
      include: { externalService: true, user: true }
    });
  }

  async logRequest(
    externalServiceId: string,
    userId: string | null,
    action: string,
    endpoint: string,
    method: string,
    params: any,
    responseStatus: number,
    responseTime: number,
    userAgent?: string,
    ipAddress?: string
  ) {
    return this.create({
      externalServiceId,
      userId,
      action,
      endpoint,
      requestMethod: method,
      requestParams: params,
      responseStatus,
      responseTime,
      userAgent,
      ipAddress
    });
  }

  async getAuditStats(externalServiceId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const totalRequests = await prisma.adaptorAuditLog.count({
      where: {
        externalServiceId,
        timestamp: { gte: since }
      }
    });

    const successfulRequests = await prisma.adaptorAuditLog.count({
      where: {
        externalServiceId,
        responseStatus: { gte: 200, lt: 400 },
        timestamp: { gte: since }
      }
    });

    const failedRequests = await prisma.adaptorAuditLog.count({
      where: {
        externalServiceId,
        responseStatus: { gte: 400 },
        timestamp: { gte: since }
      }
    });

    const avgResponseTime = await prisma.adaptorAuditLog.aggregate({
      where: {
        externalServiceId,
        timestamp: { gte: since },
        responseTime: { not: null }
      },
      _avg: { responseTime: true }
    });

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: avgResponseTime._avg.responseTime || 0,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
    };
  }
}