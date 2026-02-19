import { Test, TestingModule } from '@nestjs/testing';
import { ProjectionsController } from './projections.controller';
import { ProjectionsService } from './projections.service';

describe('ProjectionsController', () => {
  let controller: ProjectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectionsController],
      providers: [
        {
          provide: ProjectionsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProjectionsController>(ProjectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
