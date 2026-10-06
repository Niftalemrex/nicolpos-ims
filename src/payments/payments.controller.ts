import { Controller, Get, Post, Body, Param, Headers, UseInterceptors } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @RequirePermissions('sales.create')
  create(
    @CurrentUser() user: any,
    @Body() dto: CreatePaymentDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.paymentsService.create(user.tenantId, dto, idempotencyKey);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('sales.read')
  findAll(@CurrentUser() user: any) {
    return this.paymentsService.findAll(user.tenantId);
  }

  @Get('summary')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('sales.read')
  getSummary(@CurrentUser() user: any) {
    return this.paymentsService.getPaymentSummary(user.tenantId);
  }

  @Get('sale/:saleId')
  @RequirePermissions('sales.read')
  findBySale(@CurrentUser() user: any, @Param('saleId') saleId: string) {
    return this.paymentsService.findBySale(user.tenantId, saleId);
  }
}