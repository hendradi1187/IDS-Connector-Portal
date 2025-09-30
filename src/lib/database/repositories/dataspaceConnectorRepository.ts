import { prisma } from '../prisma';
import { DataspaceConnector, DataspaceConnectorStatus, Prisma } from '@prisma/client';

export class DataspaceConnectorRepository {
  async findAll() {
    return prisma.dataspaceConnector.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.dataspaceConnector.findUnique({
      where: { id }
    });
  }

  async create(data: Omit<DataspaceConnector, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.dataspaceConnector.create({
      data: {
        ...data,
        supportedFormats: data.supportedFormats as Prisma.InputJsonValue,
        capabilities: data.capabilities as Prisma.InputJsonValue
      }
    });
  }

  async update(id: string, data: Partial<Omit<DataspaceConnector, 'id' | 'createdAt' | 'updatedAt'>>) {
    const updateData: any = { ...data };
    if (updateData.supportedFormats) {
      updateData.supportedFormats = updateData.supportedFormats as Prisma.InputJsonValue;
    }
    if (updateData.capabilities) {
      updateData.capabilities = updateData.capabilities as Prisma.InputJsonValue;
    }

    return prisma.dataspaceConnector.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string) {
    return prisma.dataspaceConnector.delete({
      where: { id }
    });
  }

  async findByStatus(status: DataspaceConnectorStatus) {
    return prisma.dataspaceConnector.findMany({
      where: { status },
      orderBy: { lastHeartbeat: 'desc' }
    });
  }

  async findByVersion(version: string) {
    return prisma.dataspaceConnector.findMany({
      where: { version },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: DataspaceConnectorStatus) {
    return prisma.dataspaceConnector.update({
      where: { id },
      data: {
        status,
        lastHeartbeat: status === 'online' ? new Date() : undefined
      }
    });
  }

  async updateHeartbeat(id: string) {
    return prisma.dataspaceConnector.update({
      where: { id },
      data: {
        lastHeartbeat: new Date(),
        status: 'online'
      }
    });
  }

  async findOnlineConnectors() {
    return prisma.dataspaceConnector.findMany({
      where: {
        status: 'online',
        lastHeartbeat: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      orderBy: { lastHeartbeat: 'desc' }
    });
  }

  async findStaleConnectors() {
    return prisma.dataspaceConnector.findMany({
      where: {
        status: 'online',
        lastHeartbeat: {
          lt: new Date(Date.now() - 10 * 60 * 1000) // More than 10 minutes ago
        }
      },
      orderBy: { lastHeartbeat: 'asc' }
    });
  }

  async registerConnector(data: {
    name: string;
    connectorUrl: string;
    version: string;
    securityProfile?: string;
    supportedFormats?: any;
    capabilities?: any;
  }) {
    return prisma.dataspaceConnector.create({
      data: {
        ...data,
        status: 'offline',
        registrationId: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        supportedFormats: data.supportedFormats as Prisma.InputJsonValue,
        capabilities: data.capabilities as Prisma.InputJsonValue
      }
    });
  }

  async unregisterConnector(id: string) {
    return prisma.dataspaceConnector.update({
      where: { id },
      data: {
        status: 'offline',
        registrationId: null,
        lastHeartbeat: null
      }
    });
  }

  async getConnectorStats() {
    const stats = await prisma.dataspaceConnector.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<DataspaceConnectorStatus, number>);
  }
}