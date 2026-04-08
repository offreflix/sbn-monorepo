import { Test, TestingModule } from '@nestjs/testing';
import { MealLogsService } from './meal-logs.service';
import { MealLogsRepository } from './meal-logs.repository';
import { FoodsService } from '../foods/foods.service';
import { NotFoundException } from '@nestjs/common';
import { MealType } from './dto/create-meal-log.dto';

const mockMealLogsRepository = {
  create: jest.fn(),
  findByDateAndUser: jest.fn(),
  findById: jest.fn(),
  remove: jest.fn(),
};

const mockFoodsService = {
  findOne: jest.fn(),
};

const mockFood = {
  id: 'f1',
  name: 'Frango',
  userId: null,
  isCustom: false,
  servingSizeValue: 100,
  servingSizeUnit: 'g',
  caloriesPerServing: 165,
  proteinPerServing: 31,
  carbsPerServing: 0,
  fatPerServing: 3.6,
};

describe('MealLogsService', () => {
  let service: MealLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealLogsService,
        { provide: MealLogsRepository, useValue: mockMealLogsRepository },
        { provide: FoodsService, useValue: mockFoodsService },
      ],
    }).compile();

    service = module.get<MealLogsService>(MealLogsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should calculate snapshot correctly for 150g of frango (165 kcal/100g)', async () => {
      mockFoodsService.findOne.mockResolvedValue(mockFood);
      const mockLog = {
        id: 'ml1',
        userId: 'u1',
        foodId: 'f1',
        mealType: 'lunch',
        calcCalories: 248,
        calcProtein: 46.5,
        calcCarbs: 0,
        calcFat: 5.4,
      };
      mockMealLogsRepository.create.mockResolvedValue(mockLog);

      const dto = {
        foodId: 'f1',
        mealType: MealType.lunch,
        amountConsumed: 150,
        unitConsumed: 'g',
      };

      const result = await service.create('u1', dto);
      const createCall = mockMealLogsRepository.create.mock.calls[0][0];
      expect(createCall.calcCalories).toBe(Math.round(165 * 1.5));
      expect(result).toEqual(mockLog);
    });
  });

  describe('findByDate', () => {
    it('should group logs by meal type', async () => {
      const logs = [
        { id: 'ml1', mealType: 'breakfast', calcCalories: 300 },
        { id: 'ml2', mealType: 'lunch', calcCalories: 500 },
        { id: 'ml3', mealType: 'snack', calcCalories: 150 },
      ];
      mockMealLogsRepository.findByDateAndUser.mockResolvedValue(logs);

      const result = await service.findByDate('u1', '2024-03-15');
      expect(result.breakfast).toHaveLength(1);
      expect(result.lunch).toHaveLength(1);
      expect(result.dinner).toHaveLength(0);
      expect(result.snack).toHaveLength(1);
    });

    it('should return empty groups when no logs', async () => {
      mockMealLogsRepository.findByDateAndUser.mockResolvedValue([]);
      const result = await service.findByDate('u1', '2024-03-15');
      expect(result.breakfast).toHaveLength(0);
      expect(result.lunch).toHaveLength(0);
    });
  });

  describe('remove', () => {
    it('should delete own meal log', async () => {
      mockMealLogsRepository.findById.mockResolvedValue({ id: 'ml1', userId: 'u1' });
      mockMealLogsRepository.remove.mockResolvedValue({ id: 'ml1' });
      await service.remove('ml1', 'u1');
      expect(mockMealLogsRepository.remove).toHaveBeenCalledWith('ml1');
    });

    it('should throw NotFoundException for another user log', async () => {
      mockMealLogsRepository.findById.mockResolvedValue({ id: 'ml1', userId: 'u2' });
      await expect(service.remove('ml1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
