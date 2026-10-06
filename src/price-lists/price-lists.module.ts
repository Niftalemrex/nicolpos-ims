import { Module } from '@nestjs/common';
import { PriceListsController } from './price-lists.controller';
import { PriceListsService } from './price-lists.service';

@Module({
  controllers: [PriceListsController],
  providers: [PriceListsService]
})
export class PriceListsModule {}
