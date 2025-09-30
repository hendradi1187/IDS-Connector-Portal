import { prisma } from '../prisma';
import { Route, RouteStatus } from '@prisma/client';

export class RouteRepository {
  async findAll() {
    return prisma.route.findMany({
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, resource: true }
    });
  }

  async findById(id: string) {
    return prisma.route.findUnique({
      where: { id },
      include: { provider: true, consumer: true, resource: true }
    });
  }

  async create(data: Omit<Route, 'id' | 'createdAt'>) {
    return prisma.route.create({
      data,
      include: { provider: true, consumer: true, resource: true }
    });
  }

  async update(id: string, data: Partial<Omit<Route, 'id' | 'createdAt'>>) {
    return prisma.route.update({
      where: { id },
      data,
      include: { provider: true, consumer: true, resource: true }
    });
  }

  async delete(id: string) {
    return prisma.route.delete({
      where: { id }
    });
  }

  async findByStatus(status: RouteStatus) {
    return prisma.route.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, resource: true }
    });
  }

  async findByProviderId(providerId: string) {
    return prisma.route.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, resource: true }
    });
  }

  async findByConsumerId(consumerId: string) {
    return prisma.route.findMany({
      where: { consumerId },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, resource: true }
    });
  }
}