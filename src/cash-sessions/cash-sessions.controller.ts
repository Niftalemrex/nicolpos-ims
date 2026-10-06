import { Controller, Get, Post, Body, Param, Patch, UseInterceptors } from '@nestjs/common';
import { CashSessionsService } from './cash-sessions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('cash-sessions')
export class CashSessionsController {
  constructor(private readonly cashSessionsService: CashSessionsService) {}

  @Post('open')
  @RequirePermissions('sales.create')
  openSession(
    @CurrentUser() user: any,
    @Body() body: { branchId: string; openingCash: number },
  ) {
    return this.cashSessionsService.openSession(
      user.tenantId,
      user.id,
      body.branchId,
      body.openingCash,
    );
  }

  @Patch(':id/close')
  @RequirePermissions('sales.create')
  closeSession(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { closingCash: number },
  ) {
    return this.cashSessionsService.closeSession(user.tenantId, id, body.closingCash);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('sales.read')
  findAll(@CurrentUser() user: any) {
    return this.cashSessionsService.findAll(user.tenantId);
  }

  @Get('open')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('sales.read')
  findOpen(@CurrentUser() user: any) {
    return this.cashSessionsService.findOpenSessions(user.tenantId);
  }
}