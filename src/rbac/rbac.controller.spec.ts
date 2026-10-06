import { Test, TestingModule } from '@nestjs/testing';
import { RbacController } from './rbac.controller';

describe('RbacController', () => {
  let controller: RbacController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RbacController],
    }).compile();

    controller = module.get<RbacController>(RbacController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
