import { Controller, Get, Post, Body, Param, Patch, UseInterceptors } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @RequirePermissions('branches.manage')
  register(@CurrentUser() user: any, @Body() body: any) {
    return this.devicesService.register(user.tenantId, body.branchId, body);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('branches.read')
  findAll(@CurrentUser() user: any) {
    return this.devicesService.findAll(user.tenantId);
  }

  @Patch(':id/heartbeat')
  @RequirePermissions('branches.read')
  heartbeat(@CurrentUser() user: any, @Param('id') id: string) {
    return this.devicesService.updateLastSeen(user.tenantId, id);
  }
}