import { Test, TestingModule } from "@nestjs/testing";
import { GoalsController } from "./goals.controller";
import { GoalsService } from "./goals.service";
import { BadRequestException } from "@nestjs/common";

const mockGoalsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findCurrent: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockGoal = {
  id: "g1",
  userId: "u1",
  dailyCalorieGoal: 2000,
  proteinGoalG: 150,
  carbsGoalG: 200,
  fatGoalG: 60,
  waterGoalMl: 2000,
};

describe("GoalsController", () => {
  let controller: GoalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [{ provide: GoalsService, useValue: mockGoalsService }],
    }).compile();

    controller = module.get<GoalsController>(GoalsController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a goal", async () => {
      mockGoalsService.create.mockResolvedValue(mockGoal);
      const result = await controller.create(
        {
          dailyCalorieGoal: 2000,
          proteinGoalG: 150,
          carbsGoalG: 200,
          fatGoalG: 60,
        },
        "u1",
      );
      expect(result).toEqual(mockGoal);
    });

    it("should throw BadRequestException when x-user-id missing", () => {
      expect(() =>
        controller.create(
          {
            dailyCalorieGoal: 2000,
            proteinGoalG: 150,
            carbsGoalG: 200,
            fatGoalG: 60,
          },
          undefined,
        ),
      ).toThrow(BadRequestException);
    });
  });

  describe("findAll", () => {
    it("should return goals for user", async () => {
      mockGoalsService.findAll.mockResolvedValue([mockGoal]);
      const result = await controller.findAll("u1");
      expect(result).toHaveLength(1);
    });

    it("should throw BadRequestException when x-user-id missing", () => {
      expect(() => controller.findAll(undefined)).toThrow(BadRequestException);
    });
  });

  describe("findCurrent", () => {
    it("should return current goal", async () => {
      mockGoalsService.findCurrent.mockResolvedValue(mockGoal);
      const result = await controller.findCurrent("u1");
      expect(result).toEqual(mockGoal);
    });
  });

  describe("update", () => {
    it("should update a goal", async () => {
      mockGoalsService.update.mockResolvedValue(mockGoal);
      const result = await controller.update(
        "g1",
        { dailyCalorieGoal: 1800 },
        "u1",
      );
      expect(mockGoalsService.update).toHaveBeenCalledWith("g1", "u1", {
        dailyCalorieGoal: 1800,
      });
      expect(result).toEqual(mockGoal);
    });
  });

  describe("remove", () => {
    it("should delete a goal", async () => {
      mockGoalsService.remove.mockResolvedValue(mockGoal);
      await controller.remove("g1", "u1");
      expect(mockGoalsService.remove).toHaveBeenCalledWith("g1", "u1");
    });
  });
});
