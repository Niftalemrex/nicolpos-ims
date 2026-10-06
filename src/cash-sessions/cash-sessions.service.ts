import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CashSessionsService {
  constructor(private prisma: PrismaService) {}

  async openSession(tenantId: string, userId: string, branchId: string, openingCash: number) {
    // Check if there's already an open session
    const openSession = await this.prisma.cashSession.findFirst({
      where: {
        tenantId,
        cashierId: userId,
        status: 'OPEN',
      },
    });

    if (openSession) {
      throw new BadRequestException('You already have an open session');
    }

    return this.prisma.cashSession.create({
      data: {
        tenantId,
        branchId,
        cashierId: userId,
        openingCash,
        status: 'OPEN',
      },
    });
  }

  async closeSession(tenantId: string, sessionId: string, closingCash: number) {
    const session = await this.prisma.cashSession.findFirst({
      where: { id: sessionId, tenantId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status === 'CLOSED') {
      throw new BadRequestException('Session already closed');
    }

    // Calculate expected cash (opening + cash sales - cash refunds)
    const cashSales = await this.prisma.payment.aggregate({
      where: {
        tenantId,
        method: 'CASH',
        status: 'COMPLETED',
        createdAt: {
          gte: session.openedAt,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const expectedCash = Number(session.openingCash) + Number(cashSales._sum.amount || 0);
    const difference = closingCash - expectedCash;

    return this.prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        closingCash,
        difference,
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.cashSession.findMany({
      where: { tenantId },
      include: {
        cashier: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async findOpenSessions(tenantId: string) {
    return this.prisma.cashSession.findMany({
      where: {
        tenantId,
        status: 'OPEN',
      },
      include: {
        cashier: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}