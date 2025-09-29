import { prisma } from '../prisma';
import { NetworkSetting, NetworkProtocol, NetworkStatus } from '@/generated/prisma';

export class NetworkSettingRepository {
  async findAll() {
    return prisma.networkSetting.findMany({
      orderBy: { lastChecked: 'desc' },
      include: { provider: true }
    });
  }

  async findById(id: string) {
    return prisma.networkSetting.findUnique({
      where: { id },
      include: { provider: true }
    });
  }

  async create(data: Omit<NetworkSetting, 'id' | 'lastChecked'>) {
    return prisma.networkSetting.create({
      data,
      include: { provider: true }
    });
  }

  async update(id: string, data: Partial<Omit<NetworkSetting, 'id' | 'lastChecked'>>) {
    return prisma.networkSetting.update({
      where: { id },
      data,
      include: { provider: true }
    });
  }

  async delete(id: string) {
    return prisma.networkSetting.delete({
      where: { id }
    });
  }

  async findByProviderId(providerId: string) {
    return prisma.networkSetting.findMany({
      where: { providerId },
      orderBy: { lastChecked: 'desc' },
      include: { provider: true }
    });
  }

  async findByProtocol(protocol: NetworkProtocol) {
    return prisma.networkSetting.findMany({
      where: { protocol },
      orderBy: { lastChecked: 'desc' },
      include: { provider: true }
    });
  }

  async findByStatus(status: NetworkStatus) {
    return prisma.networkSetting.findMany({
      where: { status },
      orderBy: { lastChecked: 'desc' },
      include: { provider: true }
    });
  }

  async updateStatus(id: string, status: NetworkStatus) {
    return prisma.networkSetting.update({
      where: { id },
      data: {
        status,
        lastChecked: new Date()
      },
      include: { provider: true }
    });
  }
}