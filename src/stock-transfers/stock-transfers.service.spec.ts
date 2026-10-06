import { Test, TestingModule } from '@nestjs/testing';
import { StockTransfersService } from './stock-transfers.service';

describe('StockTransfersService', () => {
  let service: StockTransfersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockTransfersService],
    }).compile();

    service = module.get<StockTransfersService>(StockTransfersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
