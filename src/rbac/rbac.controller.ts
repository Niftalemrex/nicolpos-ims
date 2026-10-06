import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  getPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Get('roles')
  getRoles(@CurrentUser() user: any) {
    return this.rbacService.getAllRoles(user.tenantId);
  }

  @Post('roles')
  createRole(@CurrentUser() user: any, @Body() body: { name: string; description?: string }) {
    return this.rbacService.createRole(user.tenantId, body.name, body.description);
  }

  @Post('roles/:roleId/permissions/:permissionId')
  assignPermission(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rbacService.assignPermissionToRole(roleId, permissionId);
  }

  @Post('users/:userId/roles/:roleId')
  assignRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.rbacService.assignRoleToUser(userId, roleId);
  }

  @Get('users/:userId/permissions')
  getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }
}