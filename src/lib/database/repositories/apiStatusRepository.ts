import { prisma } from '../prisma';
import { ApiStatus, ApiStatusType } from '@/generated/prisma';

export class ApiStatusRepository {
  async findAll() {
    return prisma.apiStatus.findMany({
      orderBy: { lastChecked: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.apiStatus.findUnique({
      where: { id }
    });
  }

  async create(data: Omit<ApiStatus, 'id' | 'lastChecked' | 'createdAt'>) {
    return prisma.apiStatus.create({
      data
    });
  }

  async update(id: string, data: Partial<Omit<ApiStatus, 'id' | 'lastChecked' | 'createdAt'>>) {
    return prisma.apiStatus.update({
      where: { id },
      data: {
        ...data,
        lastChecked: new Date()
      }
    });
  }

  async delete(id: string) {
    return prisma.apiStatus.delete({
      where: { id }
    });
  }

  async findByServiceName(serviceName: string) {
    return prisma.apiStatus.findMany({
      where: { serviceName },
      orderBy: { lastChecked: 'desc' }
    });
  }

  async findByStatus(status: ApiStatusType) {
    return prisma.apiStatus.findMany({
      where: { status },
      orderBy: { lastChecked: 'desc' }
    });
  }

  async updateStatus(id: string, status: ApiStatusType, responseTime?: number, statusCode?: number, errorMessage?: string) {
    return prisma.apiStatus.update({
      where: { id },
      data: {
        status,
        responseTime,
        statusCode,
        errorMessage,
        lastChecked: new Date()
      }
    });
  }

  async getHealthSummary() {
    const summary = await prisma.apiStatus.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return summary.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<ApiStatusType, number>);
  }

  async getAverageResponseTime() {
    const result = await prisma.apiStatus.aggregate({
      _avg: {
        responseTime: true
      },
      where: {
        responseTime: { not: null },
        lastChecked: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    return result._avg.responseTime || 0;
  }
}