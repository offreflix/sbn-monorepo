import { Injectable, NotFoundException } from "@nestjs/common";
import { MealLogsRepository } from "./meal-logs.repository";
import { FoodsService } from "../foods/foods.service";
import { CreateMealLogDto, MealType } from "./dto/create-meal-log.dto";
import { MealType as PrismaMealType } from "@prisma/client-health";

@Injectable()
export class MealLogsService {
  constructor(
    private readonly mealLogsRepository: MealLogsRepository,
    private readonly foodsService: FoodsService,
  ) {}

  async create(userId: string, dto: CreateMealLogDto) {
    const food = await this.foodsService.findOne(dto.foodId, userId);

    const servingSize = Number(food.servingSizeValue);
    const ratio = dto.amountConsumed / servingSize;

    const calcCalories = Math.round(food.caloriesPerServing * ratio);
    const calcProtein = food.proteinPerServing
      ? Number(food.proteinPerServing) * ratio
      : undefined;
    const calcCarbs = food.carbsPerServing
      ? Number(food.carbsPerServing) * ratio
      : undefined;
    const calcFat = food.fatPerServing
      ? Number(food.fatPerServing) * ratio
      : undefined;

    const loggedAtDate = dto.loggedAtDate
      ? new Date(dto.loggedAtDate)
      : new Date();
    loggedAtDate.setUTCHours(0, 0, 0, 0);

    return this.mealLogsRepository.create({
      userId,
      foodId: food.id,
      mealType: dto.mealType as unknown as PrismaMealType,
      loggedAtDate,
      amountConsumed: dto.amountConsumed,
      unitConsumed: dto.unitConsumed,
      calcCalories,
      calcProtein,
      calcCarbs,
      calcFat,
    });
  }

  async findByDate(userId: string, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const logs = await this.mealLogsRepository.findByDateAndUser(userId, date);

    return {
      breakfast: logs.filter((l) => l.mealType === MealType.breakfast),
      lunch: logs.filter((l) => l.mealType === MealType.lunch),
      dinner: logs.filter((l) => l.mealType === MealType.dinner),
      snack: logs.filter((l) => l.mealType === MealType.snack),
    };
  }

  async findByDateRaw(userId: string, date: Date) {
    return this.mealLogsRepository.findByDateAndUser(userId, date);
  }

  async remove(id: string, userId: string) {
    const log = await this.mealLogsRepository.findById(id);
    if (!log || log.userId !== userId) {
      throw new NotFoundException("Meal log not found");
    }
    return this.mealLogsRepository.remove(id);
  }
}
