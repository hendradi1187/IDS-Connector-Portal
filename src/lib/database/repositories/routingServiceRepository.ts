import { prisma } from '../prisma';
import { RoutingService, RoutingServiceStatus, RoutingType, LoadBalancingType, Prisma } from '@prisma/client';

export class RoutingServiceRepository {
  async findAll() {
    return prisma.routingService.findMany({
      orderBy: { priority: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.routingService.findUnique({
      where: { id }
    });
  }

  async create(data: Omit<RoutingService, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.routingService.create({
      data: {
        ...data,
        configuration: data.configuration as Prisma.InputJsonValue
      },
    });
  }

  async update(id: string, data: Partial<Omit<RoutingService, 'id' | 'createdAt' | 'updatedAt'>>) {
    const updateData: any = { ...data };
    if (updateData.configuration) {
      updateData.configuration = updateData.configuration as Prisma.InputJsonValue;
    }

    return prisma.routingService.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.routingService.delete({
      where: { id }
    });
  }

  async findByStatus(status: RoutingServiceStatus) {
    return prisma.routingService.findMany({
      where: { status },
      orderBy: { priority: 'desc' },
    });
  }

  async findByRoutingType(routingType: RoutingType) {
    return prisma.routingService.findMany({
      where: { routingType },
      orderBy: { priority: 'desc' },
    });
  }

  async findByLoadBalancing(loadBalancing: LoadBalancingType) {
    return prisma.routingService.findMany({
      where: { loadBalancing },
      orderBy: { priority: 'desc' },
    });
  }

  async updateStatus(id: string, status: RoutingServiceStatus) {
    return prisma.routingService.update({
      where: { id },
      data: { status },
    });
  }

  async findActiveServices() {
    return prisma.routingService.findMany({
      where: { status: 'active' },
      orderBy: { priority: 'desc' },
      include: {
        endpoints: {
          where: { status: 'active' }
        }
      }
    });
  }

  async updatePriority(id: string, priority: number) {
    return prisma.routingService.update({
      where: { id },
      data: { priority },
    });
  }

  async getServiceStats() {
    const stats = await prisma.routingService.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<RoutingServiceStatus, number>);
  }

  async getRoutingTypeDistribution() {
    const distribution = await prisma.routingService.groupBy({
      by: ['routingType'],
      _count: {
        routingType: true
      }
    });

    return distribution.reduce((acc, item) => {
      acc[item.routingType] = item._count.routingType;
      return acc;
    }, {} as Record<RoutingType, number>);
  }
}