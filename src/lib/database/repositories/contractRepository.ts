import { prisma } from '../prisma';
import { Contract, ContractStatus, ContractType, Prisma } from '@/generated/prisma';

export class ContractRepository {
  async findAll() {
    return prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async findById(id: string) {
    return prisma.contract.findUnique({
      where: { id },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async create(data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.contract.create({
      data: {
        ...data,
        terms: data.terms as Prisma.InputJsonValue
      },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async update(id: string, data: Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>>) {
    const updateData: any = { ...data };
    if (updateData.terms) {
      updateData.terms = updateData.terms as Prisma.InputJsonValue;
    }

    return prisma.contract.update({
      where: { id },
      data: updateData,
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async delete(id: string) {
    return prisma.contract.delete({
      where: { id }
    });
  }

  async findByProviderId(providerId: string) {
    return prisma.contract.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async findByConsumerId(consumerId: string) {
    return prisma.contract.findMany({
      where: { consumerId },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async findByStatus(status: ContractStatus) {
    return prisma.contract.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async findByType(contractType: ContractType) {
    return prisma.contract.findMany({
      where: { contractType },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async findActiveContracts() {
    return prisma.contract.findMany({
      where: {
        status: 'active',
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async findExpiredContracts() {
    return prisma.contract.findMany({
      where: {
        validUntil: { lt: new Date() },
        status: { in: ['active', 'pending'] }
      },
      orderBy: { validUntil: 'desc' },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async signContract(id: string) {
    return prisma.contract.update({
      where: { id },
      data: {
        status: 'active',
        signedAt: new Date()
      },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }

  async terminateContract(id: string) {
    return prisma.contract.update({
      where: { id },
      data: {
        status: 'terminated'
      },
      include: { provider: true, consumer: true, serviceApplication: true, resource: true }
    });
  }
}