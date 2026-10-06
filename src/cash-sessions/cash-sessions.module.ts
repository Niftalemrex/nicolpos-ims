import { Module } from '@nestjs/common';
import { CashSessionsController } from './cash-sessions.controller';
import { CashSessionsService } from './cash-sessions.service';

@Module({
  controllers: [CashSessionsController],
  providers: [CashSessionsService]
})
export class CashSessionsModule {}
