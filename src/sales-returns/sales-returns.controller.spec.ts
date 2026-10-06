import { Test, TestingModule } from '@nestjs/testing';
import { SalesReturnsController } from './sales-returns.controller';

describe('SalesReturnsController', () => {
  let controller: SalesReturnsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesReturnsController],
    }).compile();

    controller = module.get<SalesReturnsController>(SalesReturnsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
