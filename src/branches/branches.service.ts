import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId },
      include: {
        warehouses: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId },
      include: {
        warehouses: true,
        sales: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }
}