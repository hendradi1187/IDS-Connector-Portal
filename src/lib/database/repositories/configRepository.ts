import { prisma } from '../prisma';
import { Config } from '@prisma/client';

export class ConfigRepository {
  async findAll() {
    return prisma.config.findMany({
      orderBy: { key: 'asc' }
    });
  }

  async findById(id: string) {
    return prisma.config.findUnique({
      where: { id }
    });
  }

  async findByKey(key: string) {
    return prisma.config.findUnique({
      where: { key }
    });
  }

  async create(data: Omit<Config, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.config.create({
      data
    });
  }

  async update(id: string, data: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>>) {
    return prisma.config.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.config.delete({
      where: { id }
    });
  }

  async findByCategory(category: string) {
    return prisma.config.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    });
  }

  async findSecrets() {
    return prisma.config.findMany({
      where: { isSecret: true },
      orderBy: { key: 'asc' }
    });
  }

  async findNonSecrets() {
    return prisma.config.findMany({
      where: { isSecret: false },
      orderBy: { key: 'asc' }
    });
  }

  async upsert(key: string, data: Omit<Config, 'id' | 'key' | 'createdAt' | 'updatedAt'>) {
    return prisma.config.upsert({
      where: { key },
      update: data,
      create: { key, ...data }
    });
  }
}