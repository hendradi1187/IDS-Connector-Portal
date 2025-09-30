import { prisma } from '../prisma';
import { ExternalService, ExternalServiceType, ExternalServiceStatus, AuthenticationType, Prisma } from '@prisma/client';

export class ExternalServiceRepository {
  async findAll() {
    return prisma.externalService.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.externalService.findUnique({
      where: { id }
    });
  }

  async create(data: Omit<ExternalService, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.externalService.create({
      data: {
        ...data,
        credentials: data.credentials as Prisma.InputJsonValue,
        metadata: data.metadata as Prisma.InputJsonValue
      }
    });
  }

  async update(id: string, data: Partial<Omit<ExternalService, 'id' | 'createdAt' | 'updatedAt'>>) {
    const updateData: any = { ...data };
    if (updateData.credentials) {
      updateData.credentials = updateData.credentials as Prisma.InputJsonValue;
    }
    if (updateData.metadata) {
      updateData.metadata = updateData.metadata as Prisma.InputJsonValue;
    }

    return prisma.externalService.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string) {
    return prisma.externalService.delete({
      where: { id }
    });
  }

  async findByServiceType(serviceType: ExternalServiceType) {
    return prisma.externalService.findMany({
      where: { serviceType },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByStatus(status: ExternalServiceStatus) {
    return prisma.externalService.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByAuthType(authType: AuthenticationType) {
    return prisma.externalService.findMany({
      where: { authType },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: ExternalServiceStatus) {
    return prisma.externalService.update({
      where: { id },
      data: {
        status,
        lastSync: status === 'active' ? new Date() : undefined
      }
    });
  }

  async updateLastSync(id: string) {
    return prisma.externalService.update({
      where: { id },
      data: {
        lastSync: new Date()
      }
    });
  }

  async findDueForSync() {
    const now = new Date();

    return prisma.externalService.findMany({
      where: {
        status: 'active',
        syncInterval: { not: null },
        OR: [
          { lastSync: null },
          {
            lastSync: {
              lte: new Date(now.getTime() - (60 * 60 * 1000)) // Default 1 hour if syncInterval is available
            }
          }
        ]
      },
      orderBy: { lastSync: 'asc' }
    });
  }

  async getServiceSummary() {
    const summary = await prisma.externalService.groupBy({
      by: ['serviceType', 'status'],
      _count: {
        id: true
      }
    });

    return summary.reduce((acc, item) => {
      if (!acc[item.serviceType]) {
        acc[item.serviceType] = {};
      }
      acc[item.serviceType][item.status] = item._count.id;
      return acc;
    }, {} as Record<ExternalServiceType, Record<ExternalServiceStatus, number>>);
  }

  async testConnection(id: string): Promise<boolean> {
    // Mock connection test - implement actual testing logic here
    try {
      const service = await this.findById(id);
      if (!service) return false;

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));

      const success = Math.random() > 0.3; // 70% success rate for demo
      await this.updateStatus(id, success ? 'active' : 'error');

      return success;
    } catch (error) {
      await this.updateStatus(id, 'error');
      return false;
    }
  }
}