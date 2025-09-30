import { prisma } from '../prisma';
import { Resource, ResourceType, AccessPolicy, Prisma } from '@prisma/client';

export class ResourceRepository {
  async findAll() {
    return prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      include: { provider: true }
    });
  }

  async findById(id: string) {
    return prisma.resource.findUnique({
      where: { id },
      include: { provider: true, requests: true, routes: true }
    });
  }

  async create(data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.resource.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue
      },
      include: { provider: true }
    });
  }

  async update(id: string, data: Partial<Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>>) {
    const updateData: any = { ...data };
    if (updateData.metadata) {
      updateData.metadata = updateData.metadata as Prisma.InputJsonValue;
    }

    return prisma.resource.update({
      where: { id },
      data: updateData,
      include: { provider: true }
    });
  }

  async delete(id: string) {
    return prisma.resource.delete({
      where: { id }
    });
  }

  async findByAccessPolicy(accessPolicy: AccessPolicy) {
    return prisma.resource.findMany({
      where: { accessPolicy },
      orderBy: { createdAt: 'desc' },
      include: { provider: true }
    });
  }

  async findByType(type: ResourceType) {
    return prisma.resource.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
      include: { provider: true }
    });
  }

  async findByProviderId(providerId: string) {
    return prisma.resource.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: { provider: true }
    });
  }
}