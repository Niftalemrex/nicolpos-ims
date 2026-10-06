import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @RequirePermissions('invoices.view')
  create(@CurrentUser() user: any, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('invoices.view')
  findAll(@CurrentUser() user: any) {
    return this.invoicesService.findAll(user.tenantId);
  }

  @Get('pending')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('invoices.view')
  getPending(@CurrentUser() user: any) {
    return this.invoicesService.getPendingClearance(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('invoices.view')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.invoicesService.findOne(user.tenantId, id);
  }
}