import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async createAccount(tenantId: string, dto: any) {
    return this.prisma.account.create({
      data: { ...dto, tenantId },
    });
  }

  async getAccounts(tenantId: string) {
    return this.prisma.account.findMany({
      where: { tenantId },
      include: { children: true },
      orderBy: { accountCode: 'asc' },
    });
  }

  async createJournalEntry(tenantId: string, dto: any) {
    const entryNumber = `JE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return this.prisma.journalEntry.create({
      data: {
        tenantId,
        entryNumber,
        description: dto.description,
        entryDate: new Date(),
        lines: {
          create: dto.lines,
        },
      },
      include: { lines: true },
    });
  }

  async getJournalEntries(tenantId: string) {
    return this.prisma.journalEntry.findMany({
      where: { tenantId },
      include: {
        lines: {
          include: { account: true },
        },
      },
      orderBy: { entryDate: 'desc' },
    });
  }
}