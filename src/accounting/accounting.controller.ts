import { Controller, Get, Post, Body, UseInterceptors } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post('accounts')
  @RequirePermissions('reports.view')
  createAccount(@CurrentUser() user: any, @Body() dto: any) {
    return this.accountingService.createAccount(user.tenantId, dto);
  }

  @Get('accounts')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('reports.view')
  getAccounts(@CurrentUser() user: any) {
    return this.accountingService.getAccounts(user.tenantId);
  }

  @Post('journal-entries')
  @RequirePermissions('reports.view')
  createJournalEntry(@CurrentUser() user: any, @Body() dto: any) {
    return this.accountingService.createJournalEntry(user.tenantId, dto);
  }

  @Get('journal-entries')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('reports.view')
  getJournalEntries(@CurrentUser() user: any) {
    return this.accountingService.getJournalEntries(user.tenantId);
  }
}