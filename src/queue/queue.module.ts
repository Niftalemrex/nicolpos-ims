import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { SalesProcessor } from './processors/sales.processor';
import { FiscalProcessor } from './processors/fiscal.processor';
import { SyncProcessor } from './processors/sync.processor';
import { QueueController } from './queue.controller';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'sales' },
      { name: 'fiscal' },
      { name: 'sync' },
    ),
  ],
  providers: [
    QueueService,
    SalesProcessor,
    FiscalProcessor,
    SyncProcessor,
  ],
  exports: [QueueService],
  controllers: [QueueController],
})
export class QueueModule {}