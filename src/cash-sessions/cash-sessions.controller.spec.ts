import { Test, TestingModule } from '@nestjs/testing';
import { CashSessionsController } from './cash-sessions.controller';

describe('CashSessionsController', () => {
  let controller: CashSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashSessionsController],
    }).compile();

    controller = module.get<CashSessionsController>(CashSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
