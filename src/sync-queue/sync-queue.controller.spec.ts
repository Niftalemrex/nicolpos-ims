import { Test, TestingModule } from '@nestjs/testing';
import { SyncQueueController } from './sync-queue.controller';

describe('SyncQueueController', () => {
  let controller: SyncQueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncQueueController],
    }).compile();

    controller = module.get<SyncQueueController>(SyncQueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
