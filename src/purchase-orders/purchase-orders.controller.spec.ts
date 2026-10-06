import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersController } from './purchase-orders.controller';

describe('PurchaseOrdersController', () => {
  let controller: PurchaseOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
    }).compile();

    controller = module.get<PurchaseOrdersController>(PurchaseOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
