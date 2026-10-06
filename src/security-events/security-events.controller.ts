import { Controller, Get, Query } from '@nestjs/common';
import { SecurityEventsService } from './security-events.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('security-events')
export class SecurityEventsController {
  constructor(private readonly securityEventsService: SecurityEventsService) {}

  @Get()
  @RequirePermissions('users.manage')
  findAll(@Query() query: any) {
    return this.securityEventsService.findAll(query);
  }
}