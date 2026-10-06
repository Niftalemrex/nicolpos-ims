import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    tenantId: string,
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string | null,
    details?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entityType,
        entityId,
        details,
      },
    });
  }

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 20, entityType, userId, action } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByEntity(tenantId: string, entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}