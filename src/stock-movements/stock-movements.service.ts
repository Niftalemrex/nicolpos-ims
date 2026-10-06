import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateStockMovementDto, idempotencyKey?: string) {
    const key = idempotencyKey || uuidv4();

    const existingKey = await this.prisma.idempotencyKey.findUnique({
      where: { tenantId_key: { tenantId, key } },
    });

    if (existingKey?.responseBody) {
      return existingKey.responseBody;
    }

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, tenantId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.quantity < 0) {
      const balance = await this.prisma.inventoryBalance.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: dto.warehouseId,
            productId: dto.productId,
          },
        },
      });

      const currentStock = balance?.quantity || 0;
      if (currentStock < Math.abs(dto.quantity)) {
        throw new BadRequestException(`Insufficient stock. Current: ${currentStock}`);
      }
    }

    const result = await this.prisma.$transaction(async (tx: any) => {
      const movement = await tx.stockMovement.create({
        data: {
          tenantId,
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          movementType: dto.movementType as any,
          quantity: dto.quantity,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
        },
      });

      await tx.inventoryBalance.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: dto.warehouseId,
            productId: dto.productId,
          },
        },
        update: {
          quantity: { increment: dto.quantity },
        },
        create: {
          tenantId,
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          quantity: dto.quantity,
        },
      });

      await tx.idempotencyKey.create({
        data: {
          tenantId,
          key,
          requestHash: JSON.stringify(dto).slice(0, 64),
          responseBody: movement,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return movement;
    });

    return result;
  }

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 20, movementType, productId } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (movementType) where.movementType = movementType;
    if (productId) where.productId = productId;

    const [total, movements] = await Promise.all([
      this.prisma.stockMovement.count({ where }),
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: { select: { name: true, sku: true } },
          warehouse: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: movements,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByProduct(tenantId: string, productId: string) {
    return this.prisma.stockMovement.findMany({
      where: { tenantId, productId },
      include: {
        warehouse: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStockSummary(tenantId: string) {
    const balances = await this.prisma.inventoryBalance.findMany({
      where: { tenantId },
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
    });

    const totalStock = balances.reduce((sum, b) => sum + b.quantity, 0);
    const totalProducts = balances.length;

    return { totalProducts, totalStock, balances };
  }
}