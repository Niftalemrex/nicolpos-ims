import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockTransfersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: any) {
    const transferNumber = `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let transferItems = [];

    for (const item of dto.items) {
      const balance = await this.prisma.inventoryBalance.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: dto.fromWarehouseId,
            productId: item.productId,
          },
        },
      });

      if (!balance || balance.quantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
      }

      transferItems.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    const transfer = await this.prisma.$transaction(async (tx: any) => {
      const newTransfer = await tx.stockTransfer.create({
        data: {
          tenantId,
          fromWarehouseId: dto.fromWarehouseId,
          toWarehouseId: dto.toWarehouseId,
          transferNumber,
          items: { create: transferItems },
        },
        include: { items: true },
      });

      for (const item of transferItems) {
        await tx.inventoryBalance.update({
          where: {
            warehouseId_productId: {
              warehouseId: dto.fromWarehouseId,
              productId: item.productId,
            },
          },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.inventoryBalance.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: dto.toWarehouseId,
              productId: item.productId,
            },
          },
          update: { quantity: { increment: item.quantity } },
          create: {
            tenantId,
            warehouseId: dto.toWarehouseId,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }

      return newTransfer;
    });

    return transfer;
  }

  async findAll(tenantId: string) {
    return this.prisma.stockTransfer.findMany({
      where: { tenantId },
      include: {
        fromWarehouse: { select: { name: true } },
        toWarehouse: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const transfer = await this.prisma.stockTransfer.findFirst({
      where: { id, tenantId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: { include: { product: true } },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }
}