import { Test, TestingModule } from '@nestjs/testing';
import { PriceListsService } from './price-lists.service';

describe('PriceListsService', () => {
  let service: PriceListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceListsService],
    }).compile();

    service = module.get<PriceListsService>(PriceListsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
