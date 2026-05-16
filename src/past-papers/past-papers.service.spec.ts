import { Test, TestingModule } from '@nestjs/testing';
import { PastPapersService } from './past-papers.service';

describe('PastPapersService', () => {
  let service: PastPapersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PastPapersService],
    }).compile();

    service = module.get<PastPapersService>(PastPapersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
