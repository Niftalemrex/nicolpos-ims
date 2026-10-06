import { Controller, Get, Post, Body, Param, Headers, UseInterceptors } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @RequirePermissions('sales.create')
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateSaleDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.salesService.create(user.tenantId, user.id, dto, idempotencyKey);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('sales.read')
  findAll(@CurrentUser() user: any) {
    return this.salesService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('sales.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.salesService.findOne(user.tenantId, id);
  }
}