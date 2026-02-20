import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

const mockDashboardService = {
  getSummary: jest.fn(),
  getCategories: jest.fn(),
  getYearOverview: jest.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should call service with parsed month and year', async () => {
      const mockResult = { cards: {}, overview: {} };
      mockDashboardService.getSummary.mockResolvedValue(mockResult);

      const result = await controller.getSummary('u1', '2', '2024');

      expect(mockDashboardService.getSummary).toHaveBeenCalledWith('u1', 2, 2024);
      expect(result).toEqual(mockResult);
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.getSummary('', '1', '2024')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCategories', () => {
    it('should call service with parsed month and year', async () => {
      const mockResult = { income: [], expense: [] };
      mockDashboardService.getCategories.mockResolvedValue(mockResult);

      const result = await controller.getCategories('u1', '3', '2024');

      expect(mockDashboardService.getCategories).toHaveBeenCalledWith('u1', 3, 2024);
      expect(result).toEqual(mockResult);
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.getCategories('', '1', '2024')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getYearOverview', () => {
    it('should call service with parsed year', async () => {
      const mockResult = { year: 2024, months: [], totals: {} };
      mockDashboardService.getYearOverview.mockResolvedValue(mockResult);

      const result = await controller.getYearOverview('u1', '2024');

      expect(mockDashboardService.getYearOverview).toHaveBeenCalledWith('u1', 2024);
      expect(result).toEqual(mockResult);
    });

    it('should use current year when year query param is not provided', async () => {
      mockDashboardService.getYearOverview.mockResolvedValue({ year: 2026, months: [], totals: {} });

      await controller.getYearOverview('u1');

      expect(mockDashboardService.getYearOverview).toHaveBeenCalledWith('u1', new Date().getFullYear());
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.getYearOverview('')).rejects.toThrow(BadRequestException);
    });
  });
});
