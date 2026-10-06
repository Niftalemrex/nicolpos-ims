import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.customer.findMany({
      where: { tenantId },
      include: {
        sales: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        sales: {
          include: {
            saleItems: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}