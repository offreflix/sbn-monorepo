import { Test, TestingModule } from '@nestjs/testing';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { BadRequestException } from '@nestjs/common';

const mockSummaryService = { getSummary: jest.fn() };

describe('SummaryController', () => {
  let controller: SummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [{ provide: SummaryService, useValue: mockSummaryService }],
    }).compile();

    controller = module.get<SummaryController>(SummaryController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return summary for date', async () => {
      const mockSummary = { date: '2024-03-15', goal: null, consumed: { calories: 0 }, water: { totalMl: 0, goalMl: null }, meals: {} };
      mockSummaryService.getSummary.mockResolvedValue(mockSummary);
      const result = await controller.getSummary('u1', '2024-03-15');
      expect(result.date).toBe('2024-03-15');
    });

    it('should throw when x-user-id missing', () => {
      expect(() => controller.getSummary(undefined, '2024-03-15')).toThrow(
        BadRequestException,
      );
    });
  });
});
