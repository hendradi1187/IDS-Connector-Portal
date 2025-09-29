import { prisma } from '../prisma';
import { ConnectorMetric, ConnectorMetricType } from '@/generated/prisma';

export class ConnectorMetricRepository {
  async findAll() {
    return prisma.connectorMetric.findMany({
      orderBy: { timestamp: 'desc' },
      include: { connectorController: true }
    });
  }

  async findById(id: string) {
    return prisma.connectorMetric.findUnique({
      where: { id },
      include: { connectorController: true }
    });
  }

  async create(data: Omit<ConnectorMetric, 'id' | 'timestamp'>) {
    return prisma.connectorMetric.create({
      data,
      include: { connectorController: true }
    });
  }

  async delete(id: string) {
    return prisma.connectorMetric.delete({
      where: { id }
    });
  }

  async findByControllerId(connectorControllerId: string, limit: number = 100) {
    return prisma.connectorMetric.findMany({
      where: { connectorControllerId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { connectorController: true }
    });
  }

  async findByMetricType(metricType: ConnectorMetricType, limit: number = 100) {
    return prisma.connectorMetric.findMany({
      where: { metricType },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { connectorController: true }
    });
  }

  async findByControllerAndType(
    connectorControllerId: string,
    metricType: ConnectorMetricType,
    limit: number = 100
  ) {
    return prisma.connectorMetric.findMany({
      where: {
        connectorControllerId,
        metricType
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { connectorController: true }
    });
  }

  async findByDateRange(
    connectorControllerId: string,
    startDate: Date,
    endDate: Date,
    metricType?: ConnectorMetricType
  ) {
    return prisma.connectorMetric.findMany({
      where: {
        connectorControllerId,
        metricType,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' },
      include: { connectorController: true }
    });
  }

  async getLatestMetrics(connectorControllerId: string) {
    const latestMetrics = await prisma.connectorMetric.groupBy({
      by: ['metricType'],
      where: { connectorControllerId },
      _max: {
        timestamp: true
      }
    });

    const metrics = await Promise.all(
      latestMetrics.map(async (group) => {
        return prisma.connectorMetric.findFirst({
          where: {
            connectorControllerId,
            metricType: group.metricType,
            timestamp: group._max.timestamp!
          },
          include: { connectorController: true }
        });
      })
    );

    return metrics.filter(Boolean);
  }

  async getAverageMetric(
    connectorControllerId: string,
    metricType: ConnectorMetricType,
    hours: number = 24
  ) {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await prisma.connectorMetric.aggregate({
      _avg: {
        value: true
      },
      where: {
        connectorControllerId,
        metricType,
        timestamp: {
          gte: startDate
        }
      }
    });

    return result._avg.value || 0;
  }

  async getMetricStats(
    connectorControllerId: string,
    metricType: ConnectorMetricType,
    hours: number = 24
  ) {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await prisma.connectorMetric.aggregate({
      _avg: { value: true },
      _min: { value: true },
      _max: { value: true },
      _count: { value: true },
      where: {
        connectorControllerId,
        metricType,
        timestamp: {
          gte: startDate
        }
      }
    });

    return {
      average: result._avg.value || 0,
      minimum: result._min.value || 0,
      maximum: result._max.value || 0,
      count: result._count.value || 0
    };
  }

  async recordMetric(
    connectorControllerId: string,
    metricType: ConnectorMetricType,
    value: number,
    unit?: string
  ) {
    return this.create({
      connectorControllerId,
      metricType,
      value,
      unit
    });
  }

  async cleanupOldMetrics(olderThanDays: number = 30) {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    return prisma.connectorMetric.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });
  }

  async getControllerResourceUsage(connectorControllerId: string) {
    const latestCpu = await prisma.connectorMetric.findFirst({
      where: {
        connectorControllerId,
        metricType: 'CPU_USAGE'
      },
      orderBy: { timestamp: 'desc' }
    });

    const latestMemory = await prisma.connectorMetric.findFirst({
      where: {
        connectorControllerId,
        metricType: 'MEMORY_USAGE'
      },
      orderBy: { timestamp: 'desc' }
    });

    const latestDisk = await prisma.connectorMetric.findFirst({
      where: {
        connectorControllerId,
        metricType: 'DISK_USAGE'
      },
      orderBy: { timestamp: 'desc' }
    });

    return {
      cpu: latestCpu?.value || 0,
      memory: latestMemory?.value || 0,
      disk: latestDisk?.value || 0,
      lastUpdated: Math.max(
        latestCpu?.timestamp.getTime() || 0,
        latestMemory?.timestamp.getTime() || 0,
        latestDisk?.timestamp.getTime() || 0
      )
    };
  }
}