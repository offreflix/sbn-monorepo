import { Test, TestingModule } from '@nestjs/testing';
import { WaterLogsService } from './water-logs.service';
import { WaterLogsRepository } from './water-logs.repository';
import { NotFoundException } from '@nestjs/common';

const mockWaterLogsRepository = {
  create: jest.fn(),
  findByDateAndUser: jest.fn(),
  findById: jest.fn(),
  remove: jest.fn(),
};

describe('WaterLogsService', () => {
  let service: WaterLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaterLogsService,
        { provide: WaterLogsRepository, useValue: mockWaterLogsRepository },
      ],
    }).compile();

    service = module.get<WaterLogsService>(WaterLogsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a water log', async () => {
      mockWaterLogsRepository.create.mockResolvedValue({ id: 'wl1', volumeMl: 500 });
      const result = await service.create('u1', { volumeMl: 500 });
      expect(result).toEqual({ id: 'wl1', volumeMl: 500 });
    });
  });

  describe('findByDate', () => {
    it('should return entries and totalMl', async () => {
      const entries = [
        { id: 'wl1', volumeMl: 300 },
        { id: 'wl2', volumeMl: 500 },
      ];
      mockWaterLogsRepository.findByDateAndUser.mockResolvedValue(entries);
      const result = await service.findByDate('u1', '2024-03-15');
      expect(result.entries).toHaveLength(2);
      expect(result.totalMl).toBe(800);
    });

    it('should return 0 totalMl when no entries', async () => {
      mockWaterLogsRepository.findByDateAndUser.mockResolvedValue([]);
      const result = await service.findByDate('u1', '2024-03-15');
      expect(result.totalMl).toBe(0);
    });
  });

  describe('remove', () => {
    it('should delete own water log', async () => {
      mockWaterLogsRepository.findById.mockResolvedValue({ id: 'wl1', userId: 'u1' });
      mockWaterLogsRepository.remove.mockResolvedValue({ id: 'wl1' });
      await service.remove('wl1', 'u1');
      expect(mockWaterLogsRepository.remove).toHaveBeenCalledWith('wl1');
    });

    it('should throw NotFoundException for another user log', async () => {
      mockWaterLogsRepository.findById.mockResolvedValue({ id: 'wl1', userId: 'u2' });
      await expect(service.remove('wl1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
