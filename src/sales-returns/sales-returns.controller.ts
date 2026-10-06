import { Controller, Get, Post, Body, Param, UseInterceptors, Headers } from '@nestjs/common';
import { SalesReturnsService } from './sales-returns.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('sales-returns')
export class SalesReturnsController {
  constructor(private readonly salesReturnsService: SalesReturnsService) {}

  @Post()
  @RequirePermissions('returns.process')
  create(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.salesReturnsService.createReturn(user.tenantId, dto, idempotencyKey);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('sales.read')
  findAll(@CurrentUser() user: any) {
    return this.salesReturnsService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('sales.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.salesReturnsService.findOne(user.tenantId, id);
  }
}