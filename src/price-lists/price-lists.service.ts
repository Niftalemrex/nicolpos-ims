import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PriceListsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: any) {
    return this.prisma.priceList.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.priceList.findMany({
      where: { tenantId },
      include: {
        productPrices: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addProductPrice(priceListId: string, dto: any) {
    return this.prisma.productPrice.create({
      data: { ...dto, priceListId },
    });
  }

  async findOne(tenantId: string, id: string) {
    const priceList = await this.prisma.priceList.findFirst({
      where: { id, tenantId },
      include: {
        productPrices: true,
      },
    });

    if (!priceList) {
      throw new NotFoundException('Price list not found');
    }

    return priceList;
  }
}