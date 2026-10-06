import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, cashierId: string, dto: CreateSaleDto, idempotencyKey?: string) {
    // Generate or use provided idempotency key
    const key = idempotencyKey || uuidv4();

    // Check if this request was already processed
    const existingKey = await this.prisma.idempotencyKey.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key,
        },
      },
    });

    if (existingKey && existingKey.responseBody) {
      console.log('✅ Duplicate request detected, returning cached response');
      return existingKey.responseBody;
    }

    let subtotal = 0;
    let taxAmount = 0;
    const saleItemsData: any[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, tenantId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      if (product.quantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = Number(item.unitPrice) * item.quantity;
      const itemTax = itemTotal * 0.15;
      
      subtotal += itemTotal;
      taxAmount += itemTax;

      saleItemsData.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal,
      });
    }

    const discount = dto.discount || 0;
    const totalAmount = subtotal + taxAmount - discount;
    const saleNumber = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const sale = await this.prisma.$transaction(async (tx: any) => {
      const newSale = await tx.sale.create({
        data: {
          tenantId,
          cashierId,
          saleNumber,
          subtotal,
          taxAmount,
          discount,
          totalAmount,
          saleItems: {
            create: saleItemsData,
          },
        },
        include: {
          saleItems: true,
        },
      });

      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Store idempotency key
      await tx.idempotencyKey.create({
        data: {
          tenantId,
          key,
          requestHash: JSON.stringify(dto).slice(0, 64),
          responseBody: newSale,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      return newSale;
    });

    return sale;
  }

  async findAll(tenantId: string) {
    return this.prisma.sale.findMany({
      where: { tenantId },
      include: {
        saleItems: true,
        cashier: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, tenantId },
      include: {
        saleItems: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }
}