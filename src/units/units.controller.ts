import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @RequirePermissions('products.create')
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.unitsService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('products.read')
  findAll(@CurrentUser() user: any) {
    return this.unitsService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('products.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.unitsService.findOne(user.tenantId, id);
  }
}