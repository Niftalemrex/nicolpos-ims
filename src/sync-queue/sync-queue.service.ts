import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncItemDto } from './dto/create-sync-item.dto';

@Injectable()
export class SyncQueueService {
  constructor(private prisma: PrismaService) {}

  async enqueue(tenantId: string, dto: CreateSyncItemDto) {
    return this.prisma.syncQueue.create({
      data: {
        tenantId,
        deviceId: dto.deviceId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        operation: dto.operation,
        payload: dto.payload,
        status: 'PENDING',
      },
    });
  }

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 20, status, deviceId } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (status) where.status = status;
    if (deviceId) where.deviceId = deviceId;

    const [total, items] = await Promise.all([
      this.prisma.syncQueue.count({ where }),
      this.prisma.syncQueue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPending(tenantId: string) {
    return this.prisma.syncQueue.findMany({
      where: {
        tenantId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async processItem(tenantId: string, id: string) {
    const item = await this.prisma.syncQueue.findFirst({
      where: { id, tenantId },
    });

    if (!item) {
      throw new NotFoundException('Sync item not found');
    }

    return this.prisma.syncQueue.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });
  }

  async markFailed(tenantId: string, id: string, error: string) {
    const item = await this.prisma.syncQueue.findFirst({
      where: { id, tenantId },
    });

    if (!item) {
      throw new NotFoundException('Sync item not found');
    }

    return this.prisma.syncQueue.update({
      where: { id },
      data: {
        status: 'FAILED',
        lastError: error,
      },
    });
  }
}