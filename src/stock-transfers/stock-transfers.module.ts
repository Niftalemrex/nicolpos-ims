import { Module } from '@nestjs/common';
import { StockTransfersController } from './stock-transfers.controller';
import { StockTransfersService } from './stock-transfers.service';

@Module({
  controllers: [StockTransfersController],
  providers: [StockTransfersService]
})
export class StockTransfersModule {}
