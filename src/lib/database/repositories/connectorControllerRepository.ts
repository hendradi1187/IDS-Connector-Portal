import { prisma } from '../prisma';
import { ConnectorController, ConnectorControllerStatus, ConnectorControllerType, Prisma } from '@/generated/prisma';

export class ConnectorControllerRepository {
  async findAll() {
    return prisma.connectorController.findMany({
      orderBy: { createdAt: 'desc' },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async findById(id: string) {
    return prisma.connectorController.findUnique({
      where: { id },
      include: { metrics: { orderBy: { timestamp: 'desc' } } }
    });
  }

  async create(data: Omit<ConnectorController, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.connectorController.create({
      data: {
        ...data,
        capabilities: data.capabilities as Prisma.InputJsonValue,
        configuration: data.configuration as Prisma.InputJsonValue
      },
      include: { metrics: true }
    });
  }

  async update(id: string, data: Partial<Omit<ConnectorController, 'id' | 'createdAt' | 'updatedAt'>>) {
    const updateData: any = { ...data };
    if (updateData.capabilities) {
      updateData.capabilities = updateData.capabilities as Prisma.InputJsonValue;
    }
    if (updateData.configuration) {
      updateData.configuration = updateData.configuration as Prisma.InputJsonValue;
    }

    return prisma.connectorController.update({
      where: { id },
      data: updateData,
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async delete(id: string) {
    return prisma.connectorController.delete({
      where: { id }
    });
  }

  async findByControllerType(controllerType: ConnectorControllerType) {
    return prisma.connectorController.findMany({
      where: { controllerType },
      orderBy: { createdAt: 'desc' },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async findByStatus(status: ConnectorControllerStatus) {
    return prisma.connectorController.findMany({
      where: { status },
      orderBy: { lastCommunication: 'desc' },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async updateStatus(id: string, status: ConnectorControllerStatus) {
    return prisma.connectorController.update({
      where: { id },
      data: {
        status,
        lastCommunication: new Date()
      },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async updateCommunication(id: string) {
    return prisma.connectorController.update({
      where: { id },
      data: {
        lastCommunication: new Date(),
        status: 'active'
      },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async findActiveControllers() {
    return prisma.connectorController.findMany({
      where: {
        status: 'active',
        lastCommunication: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      orderBy: { lastCommunication: 'desc' },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async findStaleControllers() {
    return prisma.connectorController.findMany({
      where: {
        status: 'active',
        lastCommunication: {
          lt: new Date(Date.now() - 10 * 60 * 1000) // More than 10 minutes ago
        }
      },
      orderBy: { lastCommunication: 'asc' },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async updateConfiguration(id: string, configuration: any) {
    return prisma.connectorController.update({
      where: { id },
      data: {
        configuration: configuration as Prisma.InputJsonValue
      },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async getControllerStats() {
    const stats = await prisma.connectorController.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<ConnectorControllerStatus, number>);
  }

  async getControllerTypeDistribution() {
    const distribution = await prisma.connectorController.groupBy({
      by: ['controllerType'],
      _count: {
        controllerType: true
      }
    });

    return distribution.reduce((acc, item) => {
      acc[item.controllerType] = item._count.controllerType;
      return acc;
    }, {} as Record<ConnectorControllerType, number>);
  }

  async findByIpAddress(ipAddress: string) {
    return prisma.connectorController.findMany({
      where: { ipAddress },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }

  async findByVersion(version: string) {
    return prisma.connectorController.findMany({
      where: { version },
      orderBy: { createdAt: 'desc' },
      include: { metrics: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
  }
}