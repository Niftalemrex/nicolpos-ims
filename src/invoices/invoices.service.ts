import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateInvoiceDto) {
    const sale = await this.prisma.sale.findFirst({
      where: { id: dto.saleId, tenantId },
      include: { saleItems: true },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { saleId: dto.saleId },
    });

    if (existingInvoice) {
      throw new BadRequestException('Invoice already exists for this sale');
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return this.prisma.invoice.create({
      data: {
        tenantId,
        saleId: dto.saleId,
        invoiceNumber,
        status: 'DRAFT',
      },
      include: {
        sale: {
          include: {
            saleItems: true,
            payments: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      include: {
        sale: {
          include: {
            saleItems: true,
            cashier: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        sale: {
          include: {
            saleItems: true,
            payments: true,
            cashier: true,
          },
        },
        submissions: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async getPendingClearance(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: {
          in: ['DRAFT', 'PENDING_CLEARANCE'],
        },
      },
      include: {
        sale: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}