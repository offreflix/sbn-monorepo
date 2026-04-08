import { Test, TestingModule } from '@nestjs/testing';
import { WaterLogsController } from './water-logs.controller';
import { WaterLogsService } from './water-logs.service';
import { BadRequestException } from '@nestjs/common';

const mockWaterLogsService = {
  create: jest.fn(),
  findByDate: jest.fn(),
  remove: jest.fn(),
};

describe('WaterLogsController', () => {
  let controller: WaterLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaterLogsController],
      providers: [{ provide: WaterLogsService, useValue: mockWaterLogsService }],
    }).compile();

    controller = module.get<WaterLogsController>(WaterLogsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a water log', async () => {
      mockWaterLogsService.create.mockResolvedValue({ id: 'wl1' });
      const result = await controller.create({ volumeMl: 300 }, 'u1');
      expect(result).toEqual({ id: 'wl1' });
    });

    it('should throw when x-user-id missing', () => {
      expect(() => controller.create({ volumeMl: 300 }, undefined)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByDate', () => {
    it('should return water data for date', async () => {
      mockWaterLogsService.findByDate.mockResolvedValue({ entries: [], totalMl: 0 });
      const result = await controller.findByDate('u1', '2024-03-15');
      expect(result.totalMl).toBe(0);
    });
  });

  describe('remove', () => {
    it('should remove a water log', async () => {
      mockWaterLogsService.remove.mockResolvedValue({ id: 'wl1' });
      await controller.remove('wl1', 'u1');
      expect(mockWaterLogsService.remove).toHaveBeenCalledWith('wl1', 'u1');
    });
  });
});
