import { Module } from '@nestjs/common';
import { SecurityEventsController } from './security-events.controller';
import { SecurityEventsService } from './security-events.service';

@Module({
  controllers: [SecurityEventsController],
  providers: [SecurityEventsService]
})
export class SecurityEventsModule {}
