import { Test, TestingModule } from '@nestjs/testing';
import { TaxRatesController } from './tax-rates.controller';

describe('TaxRatesController', () => {
  let controller: TaxRatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxRatesController],
    }).compile();

    controller = module.get<TaxRatesController>(TaxRatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
