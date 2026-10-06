import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';
import { StockTransfersService } from './stock-transfers.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('stock-transfers')
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @Post()
  @RequirePermissions('inventory.adjust')
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.stockTransfersService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('inventory.read')
  findAll(@CurrentUser() user: any) {
    return this.stockTransfersService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('inventory.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.stockTransfersService.findOne(user.tenantId, id);
  }
}