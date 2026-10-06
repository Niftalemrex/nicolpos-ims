import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-sales')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('reports.view')
  getDailySales(@CurrentUser() user: any) {
    return this.reportsService.getDailySalesReport(user.tenantId);
  }

  @Get('inventory')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('reports.view')
  getInventory(@CurrentUser() user: any) {
    return this.reportsService.getInventoryReport(user.tenantId);
  }

  @Get('sales-by-branch')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('reports.view')
  getSalesByBranch(@CurrentUser() user: any) {
    return this.reportsService.getSalesByBranch(user.tenantId);
  }

  @Get('sales')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('reports.view')
  getSales(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesReport(user.tenantId, startDate, endDate);
  }
}