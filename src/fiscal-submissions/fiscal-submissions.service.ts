import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFiscalSubmissionDto } from './dto/create-fiscal-submission.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FiscalSubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateFiscalSubmissionDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
      include: {
        sale: {
          include: {
            saleItems: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const existingSubmission = await this.prisma.fiscalSubmission.findFirst({
      where: { invoiceId: dto.invoiceId },
    });

    if (existingSubmission) {
      throw new BadRequestException('Invoice already submitted');
    }

    const requestPayload = {
      invoiceNumber: invoice.invoiceNumber,
      subtotal: invoice.sale.subtotal,
      taxAmount: invoice.sale.taxAmount,
      totalAmount: invoice.sale.totalAmount,
      items: invoice.sale.saleItems.map(item => ({
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    };

    const idempotencyKey = uuidv4();

    const submission = await this.prisma.fiscalSubmission.create({
      data: {
        tenantId,
        invoiceId: dto.invoiceId,
        idempotencyKey,
        requestPayload,
        status: 'PENDING',
      },
    });

    const mockResponse = {
      success: true,
      irn: `IRN-${Date.now()}`,
      rrn: `RRN-${Date.now()}`,
      message: 'Invoice cleared successfully',
    };

    await this.prisma.fiscalSubmission.update({
      where: { id: submission.id },
      data: {
        responsePayload: mockResponse,
        status: 'ACCEPTED',
        attemptCount: 1,
      },
    });

    await this.prisma.invoice.update({
      where: { id: dto.invoiceId },
      data: {
        status: 'CLEARED',
        irn: mockResponse.irn,
        rrn: mockResponse.rrn,
      },
    });

    return {
      submission: submission.id,
      status: 'ACCEPTED',
      irn: mockResponse.irn,
      rrn: mockResponse.rrn,
    };
  }

  async findAll(tenantId: string) {
    return this.prisma.fiscalSubmission.findMany({
      where: { tenantId },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const submission = await this.prisma.fiscalSubmission.findFirst({
      where: { id, tenantId },
      include: {
        invoice: {
          include: {
            sale: {
              include: {
                saleItems: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  async retry(tenantId: string, id: string) {
    const submission = await this.findOne(tenantId, id);

    if (submission.status === 'ACCEPTED') {
      throw new BadRequestException('Submission already accepted');
    }

    return this.prisma.fiscalSubmission.update({
      where: { id },
      data: {
        status: 'RETRYING',
        attemptCount: { increment: 1 },
      },
    });
  }
}