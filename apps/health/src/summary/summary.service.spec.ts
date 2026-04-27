import { Test, TestingModule } from "@nestjs/testing";
import { SummaryService } from "./summary.service";
import { GoalsService } from "../goals/goals.service";
import { MealLogsService } from "../meal-logs/meal-logs.service";
import { WaterLogsService } from "../water-logs/water-logs.service";

const mockGoalsService = { findForDate: jest.fn() };
const mockMealLogsService = { findByDate: jest.fn() };
const mockWaterLogsService = { findByDate: jest.fn() };

const emptyMeals = { breakfast: [], lunch: [], dinner: [], snack: [] };
const mockGoal = {
  dailyCalorieGoal: 2000,
  proteinGoalG: 150,
  carbsGoalG: 200,
  fatGoalG: 60,
  waterGoalMl: 2000,
};

describe("SummaryService", () => {
  let service: SummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        { provide: GoalsService, useValue: mockGoalsService },
        { provide: MealLogsService, useValue: mockMealLogsService },
        { provide: WaterLogsService, useValue: mockWaterLogsService },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getSummary", () => {
    it("should return summary with goal and data", async () => {
      mockGoalsService.findForDate.mockResolvedValue(mockGoal);
      mockMealLogsService.findByDate.mockResolvedValue({
        breakfast: [
          { calcCalories: 300, calcProtein: 20, calcCarbs: 40, calcFat: 5 },
        ],
        lunch: [
          { calcCalories: 500, calcProtein: 40, calcCarbs: 60, calcFat: 15 },
        ],
        dinner: [],
        snack: [],
      });
      mockWaterLogsService.findByDate.mockResolvedValue({
        entries: [],
        totalMl: 1500,
      });

      const result = await service.getSummary("u1", "2024-03-15");

      expect(result.date).toBe("2024-03-15");
      expect(result.goal).toEqual(mockGoal);
      expect(result.consumed.calories).toBe(800);
      expect(result.consumed.protein).toBeCloseTo(60);
      expect(result.water.totalMl).toBe(1500);
      expect(result.water.goalMl).toBe(2000);
    });

    it("should return null goal and zero consumed when no data", async () => {
      mockGoalsService.findForDate.mockRejectedValue(new Error("not found"));
      mockMealLogsService.findByDate.mockResolvedValue(emptyMeals);
      mockWaterLogsService.findByDate.mockResolvedValue({
        entries: [],
        totalMl: 0,
      });

      const result = await service.getSummary("u1", "2024-03-15");

      expect(result.goal).toBeNull();
      expect(result.consumed.calories).toBe(0);
      expect(result.water.goalMl).toBeNull();
    });
  });
});
