import { Test, TestingModule } from '@nestjs/testing';
import { SecurityEventsService } from './security-events.service';

describe('SecurityEventsService', () => {
  let service: SecurityEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityEventsService],
    }).compile();

    service = module.get<SecurityEventsService>(SecurityEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
