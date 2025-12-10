import { Test, TestingModule } from '@nestjs/testing';
import { RecurrencesController } from './recurrences.controller';

describe('RecurrencesController', () => {
  let controller: RecurrencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecurrencesController],
    }).compile();

    controller = module.get<RecurrencesController>(RecurrencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
