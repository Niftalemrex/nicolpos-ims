import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { module: 'asc' },
    });
  }

  async getAllRoles(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  async createRole(tenantId: string, name: string, description?: string) {
    return this.prisma.role.create({
      data: { tenantId, name, description },
    });
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.create({
      data: { roleId, permissionId },
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.userRoleAssignment.create({
      data: { userId, roleId },
    });
  }

  async getUserPermissions(userId: string) {
    const userRoles = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.rolePermissions) {
        permissions.add(rp.permission.code);
      }
    }

    return Array.from(permissions);
  }
}