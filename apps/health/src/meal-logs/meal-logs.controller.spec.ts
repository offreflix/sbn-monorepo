import { Test, TestingModule } from '@nestjs/testing';
import { MealLogsController } from './meal-logs.controller';
import { MealLogsService } from './meal-logs.service';
import { BadRequestException } from '@nestjs/common';
import { MealType } from './dto/create-meal-log.dto';

const mockMealLogsService = {
  create: jest.fn(),
  findByDate: jest.fn(),
  remove: jest.fn(),
};

describe('MealLogsController', () => {
  let controller: MealLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealLogsController],
      providers: [{ provide: MealLogsService, useValue: mockMealLogsService }],
    }).compile();

    controller = module.get<MealLogsController>(MealLogsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a meal log', async () => {
      mockMealLogsService.create.mockResolvedValue({ id: 'ml1' });
      const dto = { foodId: 'f1', mealType: MealType.lunch, amountConsumed: 150, unitConsumed: 'g' };
      const result = await controller.create(dto, 'u1');
      expect(result).toEqual({ id: 'ml1' });
    });

    it('should throw when x-user-id missing', () => {
      expect(() =>
        controller.create({ foodId: 'f1', mealType: MealType.lunch, amountConsumed: 150, unitConsumed: 'g' }, undefined),
      ).toThrow(BadRequestException);
    });
  });

  describe('findByDate', () => {
    it('should return grouped logs', async () => {
      const grouped = { breakfast: [], lunch: [{ id: 'ml1' }], dinner: [], snack: [] };
      mockMealLogsService.findByDate.mockResolvedValue(grouped);
      const result = await controller.findByDate('u1', '2024-03-15');
      expect(result.lunch).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('should remove meal log', async () => {
      mockMealLogsService.remove.mockResolvedValue({ id: 'ml1' });
      await controller.remove('ml1', 'u1');
      expect(mockMealLogsService.remove).toHaveBeenCalledWith('ml1', 'u1');
    });
  });
});
