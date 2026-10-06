import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductDto) {
    const { categoryId, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        tenantId,
        ...(categoryId && { categoryId }),
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        inventoryBalances: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);

    const { categoryId, ...updateData } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(categoryId && { categoryId }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }
}