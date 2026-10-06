import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    const userRoles = await this.prisma.userRoleAssignment.findMany({
      where: { userId: user.id },
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

    const userPermissions = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.rolePermissions) {
        userPermissions.add(rp.permission.code);
      }
    }

    if (user.role === 'SUPER_ADMIN' || user.role === 'TENANT_ADMIN') {
      return true;
    }

    const hasPermission = requiredPermissions.some(p => userPermissions.has(p));

    if (!hasPermission) {
      throw new ForbiddenException(`Missing required permission: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}