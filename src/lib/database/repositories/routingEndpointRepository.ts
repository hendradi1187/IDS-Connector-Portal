import { prisma } from '../prisma';
import { RoutingEndpoint, EndpointStatus } from '@/generated/prisma';

export class RoutingEndpointRepository {
  async findAll() {
    return prisma.routingEndpoint.findMany({
      orderBy: { createdAt: 'desc' },
      include: { routingService: true }
    });
  }

  async findById(id: string) {
    return prisma.routingEndpoint.findUnique({
      where: { id },
      include: { routingService: true }
    });
  }

  async create(data: Omit<RoutingEndpoint, 'id' | 'createdAt'>) {
    return prisma.routingEndpoint.create({
      data,
      include: { routingService: true }
    });
  }

  async update(id: string, data: Partial<Omit<RoutingEndpoint, 'id' | 'createdAt'>>) {
    return prisma.routingEndpoint.update({
      where: { id },
      data,
      include: { routingService: true }
    });
  }

  async delete(id: string) {
    return prisma.routingEndpoint.delete({
      where: { id }
    });
  }

  async findByRoutingServiceId(routingServiceId: string) {
    return prisma.routingEndpoint.findMany({
      where: { routingServiceId },
      orderBy: { weight: 'desc' },
      include: { routingService: true }
    });
  }

  async findByStatus(status: EndpointStatus) {
    return prisma.routingEndpoint.findMany({
      where: { status },
      orderBy: { responseTime: 'asc' },
      include: { routingService: true }
    });
  }

  async updateStatus(id: string, status: EndpointStatus) {
    return prisma.routingEndpoint.update({
      where: { id },
      data: {
        status,
        lastCheck: new Date()
      },
      include: { routingService: true }
    });
  }

  async updateResponseTime(id: string, responseTime: number) {
    return prisma.routingEndpoint.update({
      where: { id },
      data: {
        responseTime,
        lastCheck: new Date(),
        status: responseTime > 5000 ? 'unhealthy' : 'active' // Mark as unhealthy if > 5 seconds
      },
      include: { routingService: true }
    });
  }

  async findActiveEndpoints() {
    return prisma.routingEndpoint.findMany({
      where: { status: 'active' },
      orderBy: [
        { weight: 'desc' },
        { responseTime: 'asc' }
      ],
      include: { routingService: true }
    });
  }

  async findHealthyEndpointsByService(routingServiceId: string) {
    return prisma.routingEndpoint.findMany({
      where: {
        routingServiceId,
        status: 'active'
      },
      orderBy: [
        { weight: 'desc' },
        { responseTime: 'asc' }
      ],
      include: { routingService: true }
    });
  }

  async updateWeight(id: string, weight: number) {
    return prisma.routingEndpoint.update({
      where: { id },
      data: { weight },
      include: { routingService: true }
    });
  }

  async performHealthCheck(id: string): Promise<boolean> {
    try {
      const endpoint = await this.findById(id);
      if (!endpoint) return false;

      // Mock health check - implement actual HTTP check here
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000)); // Simulate request
      const responseTime = Date.now() - startTime;

      const isHealthy = Math.random() > 0.2; // 80% success rate for demo

      await this.updateResponseTime(id, responseTime);
      await this.updateStatus(id, isHealthy ? 'active' : 'unhealthy');

      return isHealthy;
    } catch (error) {
      await this.updateStatus(id, 'unhealthy');
      return false;
    }
  }

  async getEndpointStats() {
    const stats = await prisma.routingEndpoint.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<EndpointStatus, number>);
  }

  async getAverageResponseTime() {
    const result = await prisma.routingEndpoint.aggregate({
      _avg: {
        responseTime: true
      },
      where: {
        responseTime: { not: null },
        status: 'active'
      }
    });

    return result._avg.responseTime || 0;
  }
}