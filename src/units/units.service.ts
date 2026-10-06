import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: any) {
    return this.prisma.unit.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.unit.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, tenantId },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }
}