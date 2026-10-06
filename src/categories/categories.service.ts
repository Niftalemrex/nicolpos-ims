import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
      include: {
        children: true,
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: {
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}