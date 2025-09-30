import { prisma } from '../prisma';
import { Container, ContainerStatus, Prisma } from '@prisma/client';

export class ContainerRepository {
  async findAll() {
    return prisma.container.findMany({
      orderBy: { createdAt: 'desc' },
      include: { provider: true }
    });
  }

  async findById(id: string) {
    return prisma.container.findUnique({
      where: { id },
      include: { provider: true }
    });
  }

  async create(data: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.container.create({
      data: {
        ...data,
        ports: data.ports as Prisma.InputJsonValue,
        volumes: data.volumes as Prisma.InputJsonValue,
        environment: data.environment as Prisma.InputJsonValue
      },
      include: { provider: true }
    });
  }

  async update(id: string, data: Partial<Omit<Container, 'id' | 'createdAt' | 'updatedAt'>>) {
    const updateData: any = { ...data };
    if (updateData.ports) updateData.ports = updateData.ports as Prisma.InputJsonValue;
    if (updateData.volumes) updateData.volumes = updateData.volumes as Prisma.InputJsonValue;
    if (updateData.environment) updateData.environment = updateData.environment as Prisma.InputJsonValue;

    return prisma.container.update({
      where: { id },
      data: updateData,
      include: { provider: true }
    });
  }

  async delete(id: string) {
    return prisma.container.delete({
      where: { id }
    });
  }

  async findByStatus(status: ContainerStatus) {
    return prisma.container.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { provider: true }
    });
  }

  async updateStatus(id: string, status: ContainerStatus) {
    return prisma.container.update({
      where: { id },
      data: { status },
      include: { provider: true }
    });
  }

  async updateMetrics(id: string, cpuUsage: number, memoryUsage: number) {
    return prisma.container.update({
      where: { id },
      data: {
        cpuUsage,
        memoryUsage
      },
      include: { provider: true }
    });
  }
}