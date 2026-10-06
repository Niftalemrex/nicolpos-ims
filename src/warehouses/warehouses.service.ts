import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.warehouse.findMany({
      where: { tenantId },
      include: {
        branch: true,
        inventoryBalances: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, tenantId },
      include: {
        branch: true,
        inventoryBalances: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }
}