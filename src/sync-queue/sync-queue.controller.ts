import { Controller, Get, Post, Body, Param, Patch, Query, UseInterceptors } from '@nestjs/common';
import { SyncQueueService } from './sync-queue.service';
import { CreateSyncItemDto } from './dto/create-sync-item.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('sync-queue')
export class SyncQueueController {
  constructor(private readonly syncQueueService: SyncQueueService) {}

  @Post()
  @RequirePermissions('sales.create')
  enqueue(@CurrentUser() user: any, @Body() dto: CreateSyncItemDto) {
    return this.syncQueueService.enqueue(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('sales.read')
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.syncQueueService.findAll(user.tenantId, query);
  }

  @Get('pending')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('sales.read')
  getPending(@CurrentUser() user: any) {
    return this.syncQueueService.getPending(user.tenantId);
  }

  @Patch(':id/process')
  @RequirePermissions('sales.create')
  process(@CurrentUser() user: any, @Param('id') id: string) {
    return this.syncQueueService.processItem(user.tenantId, id);
  }
}