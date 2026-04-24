import { Test, TestingModule } from "@nestjs/testing";
import { MeasurementsService } from "./measurements.service";
import { MeasurementsRepository } from "./measurements.repository";
import { NotFoundException } from "@nestjs/common";

const mockMeasurementsRepository = {
  create: jest.fn(),
  findByDateRange: jest.fn(),
  findById: jest.fn(),
  remove: jest.fn(),
};

const mockMeasurement = {
  id: "m1",
  userId: "u1",
  weightKg: 75.5,
  measuredAt: new Date("2024-03-15"),
  createdAt: new Date(),
};

describe("MeasurementsService", () => {
  let service: MeasurementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeasurementsService,
        {
          provide: MeasurementsRepository,
          useValue: mockMeasurementsRepository,
        },
      ],
    }).compile();

    service = module.get<MeasurementsService>(MeasurementsService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a measurement", async () => {
      mockMeasurementsRepository.create.mockResolvedValue(mockMeasurement);
      const result = await service.create("u1", {
        weightKg: 75.5,
        measuredAt: "2024-03-15",
      });
      expect(result).toEqual(mockMeasurement);
      expect(mockMeasurementsRepository.create).toHaveBeenCalled();
    });
  });

  describe("findByDateRange", () => {
    it("should return measurements in range", async () => {
      mockMeasurementsRepository.findByDateRange.mockResolvedValue([
        mockMeasurement,
      ]);
      const result = await service.findByDateRange(
        "u1",
        "2024-01-01",
        "2024-12-31",
      );
      expect(result).toHaveLength(1);
    });

    it("should return all measurements when no range", async () => {
      mockMeasurementsRepository.findByDateRange.mockResolvedValue([
        mockMeasurement,
      ]);
      await service.findByDateRange("u1");
      expect(mockMeasurementsRepository.findByDateRange).toHaveBeenCalledWith(
        "u1",
        undefined,
        undefined,
      );
    });
  });

  describe("remove", () => {
    it("should delete own measurement", async () => {
      mockMeasurementsRepository.findById.mockResolvedValue(mockMeasurement);
      mockMeasurementsRepository.remove.mockResolvedValue(mockMeasurement);
      await service.remove("m1", "u1");
      expect(mockMeasurementsRepository.remove).toHaveBeenCalledWith("m1");
    });

    it("should throw NotFoundException for another user measurement", async () => {
      mockMeasurementsRepository.findById.mockResolvedValue({
        ...mockMeasurement,
        userId: "u2",
      });
      await expect(service.remove("m1", "u1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
