import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async register(tenantId: string, branchId: string, deviceData: any) {
    return this.prisma.device.create({
      data: {
        tenantId,
        branchId,
        deviceIdentifier: deviceData.deviceIdentifier,
        deviceType: deviceData.deviceType,
        deviceName: deviceData.deviceName,
        appVersion: deviceData.appVersion,
        osVersion: deviceData.osVersion,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.device.findMany({
      where: { tenantId },
      include: {
        branch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  async updateLastSeen(tenantId: string, id: string) {
    const device = await this.prisma.device.findFirst({
      where: { id, tenantId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return this.prisma.device.update({
      where: { id },
      data: {
        lastSeenAt: new Date(),
        lastSyncAt: new Date(),
      },
    });
  }
}