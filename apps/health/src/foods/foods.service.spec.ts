import { Test, TestingModule } from '@nestjs/testing';
import { FoodsService } from './foods.service';
import { FoodsRepository } from './foods.repository';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockFoodsRepository = {
  create: jest.fn(),
  findAllVisible: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const publicFood = {
  id: 'f1',
  name: 'Banana',
  userId: null,
  isCustom: false,
  servingSizeValue: 100,
  servingSizeUnit: 'g',
  caloriesPerServing: 89,
};

const customFood = {
  id: 'f2',
  name: 'My Shake',
  userId: 'u1',
  isCustom: true,
  servingSizeValue: 300,
  servingSizeUnit: 'ml',
  caloriesPerServing: 250,
};

describe('FoodsService', () => {
  let service: FoodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodsService,
        { provide: FoodsRepository, useValue: mockFoodsRepository },
      ],
    }).compile();

    service = module.get<FoodsService>(FoodsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a custom food', async () => {
      mockFoodsRepository.create.mockResolvedValue(customFood);
      const dto = {
        name: 'My Shake',
        servingSizeValue: 300,
        servingSizeUnit: 'ml',
        caloriesPerServing: 250,
      };
      const result = await service.create('u1', dto);
      expect(mockFoodsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isCustom: true, userId: 'u1' }),
      );
      expect(result).toEqual(customFood);
    });
  });

  describe('findAll', () => {
    it('should return public and custom foods', async () => {
      mockFoodsRepository.findAllVisible.mockResolvedValue([publicFood, customFood]);
      const result = await service.findAll('u1');
      expect(result).toHaveLength(2);
    });

    it('should pass search param to repository', async () => {
      mockFoodsRepository.findAllVisible.mockResolvedValue([publicFood]);
      await service.findAll('u1', 'banana');
      expect(mockFoodsRepository.findAllVisible).toHaveBeenCalledWith('u1', 'banana');
    });
  });

  describe('findOne', () => {
    it('should return public food for any user', async () => {
      mockFoodsRepository.findById.mockResolvedValue(publicFood);
      const result = await service.findOne('f1', 'u2');
      expect(result).toEqual(publicFood);
    });

    it('should return custom food for owner', async () => {
      mockFoodsRepository.findById.mockResolvedValue(customFood);
      const result = await service.findOne('f2', 'u1');
      expect(result).toEqual(customFood);
    });

    it('should throw NotFoundException for another user custom food', async () => {
      mockFoodsRepository.findById.mockResolvedValue(customFood);
      await expect(service.findOne('f2', 'u2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update own custom food', async () => {
      mockFoodsRepository.findById.mockResolvedValue(customFood);
      mockFoodsRepository.update.mockResolvedValue({ ...customFood, name: 'Updated' });
      const result = await service.update('f2', 'u1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw ForbiddenException on public food', async () => {
      mockFoodsRepository.findById.mockResolvedValue(publicFood);
      await expect(service.update('f1', 'u1', { name: 'X' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException for another user food', async () => {
      mockFoodsRepository.findById.mockResolvedValue(customFood);
      await expect(service.update('f2', 'u2', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete own custom food', async () => {
      mockFoodsRepository.findById.mockResolvedValue(customFood);
      mockFoodsRepository.remove.mockResolvedValue(customFood);
      await service.remove('f2', 'u1');
      expect(mockFoodsRepository.remove).toHaveBeenCalledWith('f2');
    });

    it('should throw ForbiddenException on public food', async () => {
      mockFoodsRepository.findById.mockResolvedValue(publicFood);
      await expect(service.remove('f1', 'u1')).rejects.toThrow(ForbiddenException);
    });
  });
});
