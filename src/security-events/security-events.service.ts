import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityEventsService {
  constructor(private prisma: PrismaService) {}

  async logEvent(tenantId: string | null, userId: string | null, eventType: string, severity: string, details?: any) {
    return this.prisma.securityEvent.create({
      data: {
        tenantId,
        userId,
        eventType,
        severity,
        details,
      },
    });
  }

  async findAll(query: any) {
    const where: any = {};
    if (query.severity) where.severity = query.severity;
    if (query.eventType) where.eventType = query.eventType;

    return this.prisma.securityEvent.findMany({
      where,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}