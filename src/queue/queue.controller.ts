import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { QueueService } from './queue.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('sale')
  enqueueSale(@CurrentUser() user: any, @Body() data: any) {
    return this.queueService.addSaleToQueue({
      ...data,
      tenantId: user.tenantId,
      cashierId: user.id,
    });
  }

  @Post('fiscal')
  enqueueFiscal(@CurrentUser() user: any, @Body() data: any) {
    return this.queueService.addFiscalSubmission({
      ...data,
      tenantId: user.tenantId,
    });
  }

  @Post('sync')
  enqueueSync(@CurrentUser() user: any, @Body() data: any) {
    return this.queueService.addSyncItem({
      ...data,
      tenantId: user.tenantId,
    });
  }

  @Get('stats')
  getStats() {
    return this.queueService.getQueueStats();
  }

  @Get('failed')
  getFailed() {
    return this.queueService.getFailedJobs();
  }

  @Patch(':queueName/retry')
  retryFailed(@Param('queueName') queueName: string) {
    return this.queueService.retryFailedJobs(queueName);
  }

  @Patch(':queueName/pause')
  pauseQueue(@Param('queueName') queueName: string) {
    return this.queueService.pauseQueue(queueName);
  }

  @Patch(':queueName/resume')
  resumeQueue(@Param('queueName') queueName: string) {
    return this.queueService.resumeQueue(queueName);
  }
}