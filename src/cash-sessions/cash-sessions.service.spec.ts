import { Test, TestingModule } from '@nestjs/testing';
import { CashSessionsService } from './cash-sessions.service';

describe('CashSessionsService', () => {
  let service: CashSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashSessionsService],
    }).compile();

    service = module.get<CashSessionsService>(CashSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
