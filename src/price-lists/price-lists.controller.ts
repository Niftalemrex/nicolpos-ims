import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';
import { PriceListsService } from './price-lists.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('price-lists')
export class PriceListsController {
  constructor(private readonly priceListsService: PriceListsService) {}

  @Post()
  @RequirePermissions('products.update')
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.priceListsService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('products.read')
  findAll(@CurrentUser() user: any) {
    return this.priceListsService.findAll(user.tenantId);
  }

  @Post(':id/prices')
  @RequirePermissions('products.update')
  addPrice(@Param('id') id: string, @Body() dto: any) {
    return this.priceListsService.addProductPrice(id, dto);
  }

  @Get(':id')
  @RequirePermissions('products.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.priceListsService.findOne(user.tenantId, id);
  }
}