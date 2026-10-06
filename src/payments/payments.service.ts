import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePaymentDto, idempotencyKey?: string) {
    const key = idempotencyKey || uuidv4();

    const existingKey = await this.prisma.idempotencyKey.findUnique({
      where: { tenantId_key: { tenantId, key } },
    });

    if (existingKey?.responseBody) {
      return existingKey.responseBody;
    }

    const sale = await this.prisma.sale.findFirst({
      where: { id: dto.saleId, tenantId },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        saleId: dto.saleId,
        method: dto.method as any,
        amount: dto.amount,
      },
    });

    await this.prisma.idempotencyKey.create({
      data: {
        tenantId,
        key,
        requestHash: JSON.stringify(dto).slice(0, 64),
        responseBody: payment,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return payment;
  }

  async findAll(tenantId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId },
      include: {
        sale: { select: { saleNumber: true, totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySale(tenantId: string, saleId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId, saleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentSummary(tenantId: string) {
    const payments = await this.prisma.payment.groupBy({
      by: ['method'],
      where: { tenantId, status: 'COMPLETED' },
      _sum: { amount: true },
      _count: { id: true },
    });

    return payments;
  }
}