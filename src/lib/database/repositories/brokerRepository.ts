import { prisma } from '../prisma';
import { Broker, ValidationStatus } from '@prisma/client';

export class BrokerRepository {
  async findAll() {
    return prisma.broker.findMany({
      orderBy: { timestamp: 'desc' },
      include: { request: true }
    });
  }

  async findById(id: string) {
    return prisma.broker.findUnique({
      where: { id },
      include: { request: true }
    });
  }

  async create(data: Omit<Broker, 'id' | 'timestamp'>) {
    return prisma.broker.create({
      data,
      include: { request: true }
    });
  }

  async update(id: string, data: Partial<Omit<Broker, 'id' | 'timestamp'>>) {
    return prisma.broker.update({
      where: { id },
      data,
      include: { request: true }
    });
  }

  async delete(id: string) {
    return prisma.broker.delete({
      where: { id }
    });
  }

  async findByValidationStatus(validationStatus: ValidationStatus) {
    return prisma.broker.findMany({
      where: { validationStatus },
      orderBy: { timestamp: 'desc' },
      include: { request: true }
    });
  }
}