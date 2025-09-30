import { prisma } from '../prisma';
import { ServiceApplication, ServiceApplicationStatus, Prisma } from '@prisma/client';

export class ServiceApplicationRepository {
  async findAll() {
    return prisma.serviceApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: { provider: true, contracts: true }
    });
  }

  async findById(id: string) {
    return prisma.serviceApplication.findUnique({
      where: { id },
      include: { provider: true, contracts: true }
    });
  }

  async create(data: Omit<ServiceApplication, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.serviceApplication.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue
      },
      include: { provider: true, contracts: true }
    });
  }

  async update(id: string, data: Partial<Omit<ServiceApplication, 'id' | 'createdAt' | 'updatedAt'>>) {
    const updateData: any = { ...data };
    if (updateData.metadata) {
      updateData.metadata = updateData.metadata as Prisma.InputJsonValue;
    }

    return prisma.serviceApplication.update({
      where: { id },
      data: updateData,
      include: { provider: true, contracts: true }
    });
  }

  async delete(id: string) {
    return prisma.serviceApplication.delete({
      where: { id }
    });
  }

  async findByProviderId(providerId: string) {
    return prisma.serviceApplication.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, contracts: true }
    });
  }

  async findByStatus(status: ServiceApplicationStatus) {
    return prisma.serviceApplication.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, contracts: true }
    });
  }

  async updateStatus(id: string, status: ServiceApplicationStatus) {
    return prisma.serviceApplication.update({
      where: { id },
      data: {
        status,
        lastCheck: new Date()
      },
      include: { provider: true, contracts: true }
    });
  }

  async updateHealthCheck(id: string, isHealthy: boolean) {
    return prisma.serviceApplication.update({
      where: { id },
      data: {
        status: isHealthy ? 'active' : 'error',
        lastCheck: new Date()
      },
      include: { provider: true, contracts: true }
    });
  }
}