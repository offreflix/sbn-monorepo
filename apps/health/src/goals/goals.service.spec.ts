import { Test, TestingModule } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { GoalsRepository } from './goals.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockGoalsRepository = {
  create: jest.fn(),
  findAllByUser: jest.fn(),
  findCurrent: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockGoal = {
  id: 'g1',
  userId: 'u1',
  dailyCalorieGoal: 2000,
  proteinGoalG: 150,
  carbsGoalG: 200,
  fatGoalG: 60,
  waterGoalMl: 2000,
  activeFrom: new Date('2024-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GoalsService', () => {
  let service: GoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        { provide: GoalsRepository, useValue: mockGoalsRepository },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a goal', async () => {
      mockGoalsRepository.create.mockResolvedValue(mockGoal);
      const dto = {
        dailyCalorieGoal: 2000,
        proteinGoalG: 150,
        carbsGoalG: 200,
        fatGoalG: 60,
        activeFrom: '2024-01-01',
      };
      const result = await service.create('u1', dto);
      expect(result).toEqual(mockGoal);
      expect(mockGoalsRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException on unique constraint violation', async () => {
      mockGoalsRepository.create.mockRejectedValue({ code: 'P2002' });
      await expect(
        service.create('u1', {
          dailyCalorieGoal: 2000,
          proteinGoalG: 150,
          carbsGoalG: 200,
          fatGoalG: 60,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all goals for user', async () => {
      mockGoalsRepository.findAllByUser.mockResolvedValue([mockGoal]);
      const result = await service.findAll('u1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findCurrent', () => {
    it('should return active goal', async () => {
      mockGoalsRepository.findCurrent.mockResolvedValue(mockGoal);
      const result = await service.findCurrent('u1');
      expect(result).toEqual(mockGoal);
    });

    it('should throw NotFoundException when no active goal', async () => {
      mockGoalsRepository.findCurrent.mockResolvedValue(null);
      await expect(service.findCurrent('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update goal when user owns it', async () => {
      mockGoalsRepository.findById.mockResolvedValue(mockGoal);
      mockGoalsRepository.update.mockResolvedValue({
        ...mockGoal,
        dailyCalorieGoal: 1800,
      });
      const result = await service.update('g1', 'u1', {
        dailyCalorieGoal: 1800,
      });
      expect(result.dailyCalorieGoal).toBe(1800);
    });

    it('should throw NotFoundException when goal belongs to another user', async () => {
      mockGoalsRepository.findById.mockResolvedValue({
        ...mockGoal,
        userId: 'u2',
      });
      await expect(
        service.update('g1', 'u1', { dailyCalorieGoal: 1800 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete goal when user owns it', async () => {
      mockGoalsRepository.findById.mockResolvedValue(mockGoal);
      mockGoalsRepository.remove.mockResolvedValue(mockGoal);
      await service.remove('g1', 'u1');
      expect(mockGoalsRepository.remove).toHaveBeenCalledWith('g1');
    });

    it('should throw NotFoundException when goal not found', async () => {
      mockGoalsRepository.findById.mockResolvedValue(null);
      await expect(service.remove('g1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
