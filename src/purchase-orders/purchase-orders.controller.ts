import { Controller, Get, Post, Body, Param, Headers, UseInterceptors } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @RequirePermissions('inventory.adjust')
  create(
    @CurrentUser() user: any,
    @Body() dto: CreatePurchaseOrderDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.purchaseOrdersService.create(user.tenantId, dto, idempotencyKey);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('inventory.read')
  findAll(@CurrentUser() user: any) {
    return this.purchaseOrdersService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('inventory.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.purchaseOrdersService.findOne(user.tenantId, id);
  }
}