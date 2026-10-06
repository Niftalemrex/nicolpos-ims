import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SalesReturnsService {
  constructor(private prisma: PrismaService) {}

  async createReturn(tenantId: string, dto: any, idempotencyKey?: string) {
    const key = idempotencyKey || uuidv4();

    const existingKey = await this.prisma.idempotencyKey.findUnique({
      where: { tenantId_key: { tenantId, key } },
    });

    if (existingKey?.responseBody) {
      return existingKey.responseBody;
    }

    const sale = await this.prisma.sale.findFirst({
      where: { id: dto.saleId, tenantId },
      include: { saleItems: true },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    const returnNumber = `RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let totalAmount = 0;
    const returnItemsData: any[] = [];

    for (const item of dto.items) {
      const saleItem = sale.saleItems.find((si: any) => si.id === item.saleItemId);
      if (!saleItem) {
        throw new NotFoundException(`Sale item ${item.saleItemId} not found`);
      }

      if (item.quantity > saleItem.quantity) {
        throw new BadRequestException(`Cannot return more than sold quantity for ${saleItem.productName}`);
      }

      const itemTotal = Number(saleItem.unitPrice) * item.quantity;
      totalAmount += itemTotal;

      returnItemsData.push({
        saleItemId: saleItem.id,
        productId: saleItem.productId,
        quantity: item.quantity,
        unitPrice: saleItem.unitPrice,
        totalAmount: itemTotal,
      });
    }

    const salesReturn = await this.prisma.$transaction(async (tx: any) => {
      const newReturn = await tx.salesReturn.create({
        data: {
          tenantId,
          saleId: dto.saleId,
          returnNumber,
          reason: dto.reason,
          totalAmount,
          items: { create: returnItemsData },
        },
        include: { items: true },
      });

      for (const item of returnItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      await tx.idempotencyKey.create({
        data: {
          tenantId,
          key,
          requestHash: JSON.stringify(dto).slice(0, 64),
          responseBody: newReturn,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return newReturn;
    });

    return salesReturn;
  }

  async findAll(tenantId: string) {
    return this.prisma.salesReturn.findMany({
      where: { tenantId },
      include: {
        sale: { select: { saleNumber: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const salesReturn = await this.prisma.salesReturn.findFirst({
      where: { id, tenantId },
      include: {
        sale: true,
        items: { include: { product: true } },
      },
    });

    if (!salesReturn) {
      throw new NotFoundException('Return not found');
    }

    return salesReturn;
  }
}