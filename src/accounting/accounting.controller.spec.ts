import { Test, TestingModule } from '@nestjs/testing';
import { AccountingController } from './accounting.controller';

describe('AccountingController', () => {
  let controller: AccountingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountingController],
    }).compile();

    controller = module.get<AccountingController>(AccountingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
