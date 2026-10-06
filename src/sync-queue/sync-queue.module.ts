import { Module } from '@nestjs/common';
import { SyncQueueController } from './sync-queue.controller';
import { SyncQueueService } from './sync-queue.service';

@Module({
  controllers: [SyncQueueController],
  providers: [SyncQueueService]
})
export class SyncQueueModule {}
