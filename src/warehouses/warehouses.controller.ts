import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @RequirePermissions('branches.manage')
  create(@CurrentUser() user: any, @Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('branches.read')
  findAll(@CurrentUser() user: any) {
    return this.warehousesService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('branches.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.warehousesService.findOne(user.tenantId, id);
  }
}