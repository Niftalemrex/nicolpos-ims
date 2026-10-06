import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaxRatesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: any) {
    return this.prisma.taxRate.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.taxRate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const taxRate = await this.prisma.taxRate.findFirst({
      where: { id, tenantId },
    });

    if (!taxRate) {
      throw new NotFoundException('Tax rate not found');
    }

    return taxRate;
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.taxRate.update({
      where: { id },
      data: dto,
    });
  }
}