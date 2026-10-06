import { Controller, Get, Post, Body, Param, Patch, UseInterceptors } from '@nestjs/common';
import { FiscalSubmissionsService } from './fiscal-submissions.service';
import { CreateFiscalSubmissionDto } from './dto/create-fiscal-submission.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('fiscal-submissions')
export class FiscalSubmissionsController {
  constructor(private readonly fiscalSubmissionsService: FiscalSubmissionsService) {}

  @Post()
  @RequirePermissions('invoices.view')
  create(@CurrentUser() user: any, @Body() dto: CreateFiscalSubmissionDto) {
    return this.fiscalSubmissionsService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('invoices.view')
  findAll(@CurrentUser() user: any) {
    return this.fiscalSubmissionsService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('invoices.view')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.fiscalSubmissionsService.findOne(user.tenantId, id);
  }

  @Patch(':id/retry')
  @RequirePermissions('invoices.cancel')
  retry(@CurrentUser() user: any, @Param('id') id: string) {
    return this.fiscalSubmissionsService.retry(user.tenantId, id);
  }
}