import { Controller, Get, Post, Body, Param, Patch, UseInterceptors } from '@nestjs/common';
import { TaxRatesService } from './tax-rates.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('tax-rates')
export class TaxRatesController {
  constructor(private readonly taxRatesService: TaxRatesService) {}

  @Post()
  @RequirePermissions('tax.manage')
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.taxRatesService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('tax.manage')
  findAll(@CurrentUser() user: any) {
    return this.taxRatesService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('tax.manage')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.taxRatesService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('tax.manage')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.taxRatesService.update(user.tenantId, id, dto);
  }
}