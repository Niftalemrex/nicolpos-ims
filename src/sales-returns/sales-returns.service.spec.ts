import { Test, TestingModule } from '@nestjs/testing';
import { SalesReturnsService } from './sales-returns.service';

describe('SalesReturnsService', () => {
  let service: SalesReturnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesReturnsService],
    }).compile();

    service = module.get<SalesReturnsService>(SalesReturnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
