import { Module } from '@nestjs/common';
import { FiscalSubmissionsController } from './fiscal-submissions.controller';
import { FiscalSubmissionsService } from './fiscal-submissions.service';

@Module({
  controllers: [FiscalSubmissionsController],
  providers: [FiscalSubmissionsService]
})
export class FiscalSubmissionsModule {}
