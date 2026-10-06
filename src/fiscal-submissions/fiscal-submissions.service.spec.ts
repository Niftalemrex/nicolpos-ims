import { Test, TestingModule } from '@nestjs/testing';
import { FiscalSubmissionsService } from './fiscal-submissions.service';

describe('FiscalSubmissionsService', () => {
  let service: FiscalSubmissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FiscalSubmissionsService],
    }).compile();

    service = module.get<FiscalSubmissionsService>(FiscalSubmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
