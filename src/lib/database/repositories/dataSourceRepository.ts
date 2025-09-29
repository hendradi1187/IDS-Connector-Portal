import { prisma } from '../prisma';
import { DataSource, Prisma } from '@/generated/prisma';

export class DataSourceRepository {
  async findAll() {
    return prisma.dataSource.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.dataSource.findUnique({
      where: { id }
    });
  }

  async create(data: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.dataSource.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue
      }
    });
  }

  async update(id: string, data: Partial<Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>>) {
    const updateData: any = { ...data };
    if (updateData.metadata) {
      updateData.metadata = updateData.metadata as Prisma.InputJsonValue;
    }

    return prisma.dataSource.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string) {
    return prisma.dataSource.delete({
      where: { id }
    });
  }

  async findByType(type: string) {
    return prisma.dataSource.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByStatus(status: string) {
    return prisma.dataSource.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.dataSource.update({
      where: { id },
      data: {
        status,
        lastSync: status === 'active' ? new Date() : undefined
      }
    });
  }

  async testConnection(id: string): Promise<boolean> {
    const dataSource = await this.findById(id);
    if (!dataSource) return false;

    try {
      // Here you would implement actual connection testing logic
      // For now, we'll simulate a connection test
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status based on connection test
      await this.updateStatus(id, 'active');
      return true;
    } catch (error) {
      await this.updateStatus(id, 'error');
      return false;
    }
  }
}