import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.auditLogsService.findAll(user.tenantId, query);
  }

  @Get(':entityType/:entityId')
  findByEntity(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogsService.findByEntity(user.tenantId, entityType, entityId);
  }
}