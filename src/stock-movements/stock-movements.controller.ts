import { Controller, Get, Post, Body, Param, Query, UseInterceptors, Headers } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @RequirePermissions('inventory.adjust')
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateStockMovementDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.stockMovementsService.create(user.tenantId, dto, idempotencyKey);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('inventory.read')
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.stockMovementsService.findAll(user.tenantId, query);
  }

  @Get('summary')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('inventory.read')
  getSummary(@CurrentUser() user: any) {
    return this.stockMovementsService.getStockSummary(user.tenantId);
  }

  @Get('product/:productId')
  @RequirePermissions('inventory.read')
  findByProduct(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.stockMovementsService.findByProduct(user.tenantId, productId);
  }
}