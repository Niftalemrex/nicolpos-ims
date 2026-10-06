import { Test, TestingModule } from '@nestjs/testing';
import { SyncQueueService } from './sync-queue.service';

describe('SyncQueueService', () => {
  let service: SyncQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncQueueService],
    }).compile();

    service = module.get<SyncQueueService>(SyncQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
