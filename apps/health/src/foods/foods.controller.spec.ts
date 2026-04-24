import { Test, TestingModule } from "@nestjs/testing";
import { FoodsController } from "./foods.controller";
import { FoodsService } from "./foods.service";
import { BadRequestException } from "@nestjs/common";

const mockFoodsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockFood = { id: "f1", name: "Banana", userId: null, isCustom: false };

describe("FoodsController", () => {
  let controller: FoodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodsController],
      providers: [{ provide: FoodsService, useValue: mockFoodsService }],
    }).compile();

    controller = module.get<FoodsController>(FoodsController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a food", async () => {
      mockFoodsService.create.mockResolvedValue(mockFood);
      const dto = {
        name: "Banana",
        servingSizeValue: 100,
        servingSizeUnit: "g",
        caloriesPerServing: 89,
      };
      const result = await controller.create(dto, "u1");
      expect(result).toEqual(mockFood);
    });

    it("should throw when x-user-id missing", () => {
      expect(() =>
        controller.create(
          {
            name: "Banana",
            servingSizeValue: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 89,
          },
          undefined,
        ),
      ).toThrow(BadRequestException);
    });
  });

  describe("findAll", () => {
    it("should return foods", async () => {
      mockFoodsService.findAll.mockResolvedValue([mockFood]);
      const result = await controller.findAll("u1", undefined);
      expect(result).toHaveLength(1);
    });
  });

  describe("findOne", () => {
    it("should return a food", async () => {
      mockFoodsService.findOne.mockResolvedValue(mockFood);
      const result = await controller.findOne("f1", "u1");
      expect(result).toEqual(mockFood);
    });
  });

  describe("update", () => {
    it("should update a food", async () => {
      mockFoodsService.update.mockResolvedValue(mockFood);
      await controller.update("f1", { name: "Updated" }, "u1");
      expect(mockFoodsService.update).toHaveBeenCalledWith("f1", "u1", {
        name: "Updated",
      });
    });
  });

  describe("remove", () => {
    it("should remove a food", async () => {
      mockFoodsService.remove.mockResolvedValue(mockFood);
      await controller.remove("f1", "u1");
      expect(mockFoodsService.remove).toHaveBeenCalledWith("f1", "u1");
    });
  });
});
