import { Test, TestingModule } from '@nestjs/testing';
import { PastPapersController } from './past-papers.controller';

describe('PastPapersController', () => {
  let controller: PastPapersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PastPapersController],
    }).compile();

    controller = module.get<PastPapersController>(PastPapersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
