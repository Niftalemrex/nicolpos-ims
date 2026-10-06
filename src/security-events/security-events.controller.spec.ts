import { Test, TestingModule } from '@nestjs/testing';
import { SecurityEventsController } from './security-events.controller';

describe('SecurityEventsController', () => {
  let controller: SecurityEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityEventsController],
    }).compile();

    controller = module.get<SecurityEventsController>(SecurityEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
