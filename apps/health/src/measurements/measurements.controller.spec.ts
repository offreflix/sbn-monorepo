import { Test, TestingModule } from "@nestjs/testing";
import { MeasurementsController } from "./measurements.controller";
import { MeasurementsService } from "./measurements.service";
import { BadRequestException } from "@nestjs/common";

const mockMeasurementsService = {
  create: jest.fn(),
  findByDateRange: jest.fn(),
  remove: jest.fn(),
};

describe("MeasurementsController", () => {
  let controller: MeasurementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeasurementsController],
      providers: [
        { provide: MeasurementsService, useValue: mockMeasurementsService },
      ],
    }).compile();

    controller = module.get<MeasurementsController>(MeasurementsController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a measurement", async () => {
      mockMeasurementsService.create.mockResolvedValue({ id: "m1" });
      const result = await controller.create({ weightKg: 75.5 }, "u1");
      expect(result).toEqual({ id: "m1" });
    });

    it("should throw when x-user-id missing", () => {
      expect(() => controller.create({ weightKg: 75.5 }, undefined)).toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("should return measurements", async () => {
      mockMeasurementsService.findByDateRange.mockResolvedValue([{ id: "m1" }]);
      const result = await controller.findAll("u1", "2024-01-01", "2024-12-31");
      expect(result).toHaveLength(1);
    });
  });

  describe("remove", () => {
    it("should remove a measurement", async () => {
      mockMeasurementsService.remove.mockResolvedValue({ id: "m1" });
      await controller.remove("m1", "u1");
      expect(mockMeasurementsService.remove).toHaveBeenCalledWith("m1", "u1");
    });
  });
});
