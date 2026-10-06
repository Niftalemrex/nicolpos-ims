import { Test, TestingModule } from '@nestjs/testing';
import { FiscalSubmissionsController } from './fiscal-submissions.controller';

describe('FiscalSubmissionsController', () => {
  let controller: FiscalSubmissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FiscalSubmissionsController],
    }).compile();

    controller = module.get<FiscalSubmissionsController>(FiscalSubmissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
