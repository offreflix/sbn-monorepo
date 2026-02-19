import { Test, TestingModule } from '@nestjs/testing';
import { ProjectionsService } from './projections.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectionsService', () => {
  let service: ProjectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectionsService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProjectionsService>(ProjectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
