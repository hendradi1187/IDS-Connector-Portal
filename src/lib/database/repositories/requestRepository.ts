import { prisma } from '../prisma';
import { Request, RequestType, RequestStatus, Prisma } from '@prisma/client';

export class RequestRepository {
  async findAll() {
    return prisma.request.findMany({
      orderBy: { createdAt: 'desc' },
      include: { requester: true, provider: true, resource: true }
    });
  }

  async findById(id: string) {
    return prisma.request.findUnique({
      where: { id },
      include: { requester: true, provider: true, resource: true, brokers: true }
    });
  }

  async create(data: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.request.create({
      data,
      include: { requester: true, provider: true, resource: true }
    });
  }

  async update(id: string, data: Partial<Omit<Request, 'id' | 'createdAt' | 'updatedAt'>>) {
    return prisma.request.update({
      where: { id },
      data,
      include: { requester: true, provider: true, resource: true }
    });
  }

  async delete(id: string) {
    return prisma.request.delete({
      where: { id }
    });
  }

  async findByRequesterId(requesterId: string) {
    return prisma.request.findMany({
      where: { requesterId },
      orderBy: { createdAt: 'desc' },
      include: { requester: true, provider: true, resource: true }
    });
  }

  async findByProviderId(providerId: string) {
    return prisma.request.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: { requester: true, provider: true, resource: true }
    });
  }

  async findByStatus(status: RequestStatus) {
    return prisma.request.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { requester: true, provider: true, resource: true }
    });
  }

  async findByRequestType(requestType: RequestType) {
    return prisma.request.findMany({
      where: { requestType },
      orderBy: { createdAt: 'desc' },
      include: { requester: true, provider: true, resource: true }
    });
  }

  async updateStatus(id: string, status: RequestStatus) {
    return prisma.request.update({
      where: { id },
      data: { status },
      include: { requester: true, provider: true, resource: true }
    });
  }
}