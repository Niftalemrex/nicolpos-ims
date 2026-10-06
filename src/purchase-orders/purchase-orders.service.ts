import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePurchaseOrderDto, idempotencyKey?: string) {
    const key = idempotencyKey || uuidv4();

    // Check idempotency
    const existingKey = await this.prisma.idempotencyKey.findUnique({
      where: { tenantId_key: { tenantId, key } },
    });

    if (existingKey?.responseBody) {
      return existingKey.responseBody;
    }

    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, tenantId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    let subtotal = 0;
    const itemsData: any[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, tenantId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const totalCost = item.quantity * item.unitCost;
      subtotal += totalCost;

      itemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost,
      });
    }

    const taxAmount = subtotal * 0.15;
    const totalAmount = subtotal + taxAmount;
    const orderNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const purchaseOrder = await this.prisma.$transaction(async (tx: any) => {
      const po = await tx.purchaseOrder.create({
        data: {
          tenantId,
          supplierId: dto.supplierId,
          orderNumber,
          subtotal,
          taxAmount,
          totalAmount,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of itemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      // Store idempotency key
      await tx.idempotencyKey.create({
        data: {
          tenantId,
          key,
          requestHash: JSON.stringify(dto).slice(0, 64),
          responseBody: po,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return po;
    });

    return purchaseOrder;
  }

  async findAll(tenantId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: {
        supplier: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });

    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }

    return po;
  }
}