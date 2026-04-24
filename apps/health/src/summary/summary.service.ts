import { Injectable } from "@nestjs/common";
import { GoalsService } from "../goals/goals.service";
import { MealLogsService } from "../meal-logs/meal-logs.service";
import { WaterLogsService } from "../water-logs/water-logs.service";

@Injectable()
export class SummaryService {
  constructor(
    private readonly goalsService: GoalsService,
    private readonly mealLogsService: MealLogsService,
    private readonly waterLogsService: WaterLogsService,
  ) {}

  async getSummary(userId: string, dateStr?: string) {
    const dateIso = dateStr ?? new Date().toISOString().split("T")[0];

    const [goal, meals, water] = await Promise.all([
      this.goalsService
        .findForDate(userId, new Date(dateIso))
        .catch(() => null),
      this.mealLogsService.findByDate(userId, dateIso),
      this.waterLogsService.findByDate(userId, dateIso),
    ]);

    const allLogs = [
      ...meals.breakfast,
      ...meals.lunch,
      ...meals.dinner,
      ...meals.snack,
    ];

    const consumed = {
      calories: allLogs.reduce((s, l) => s + l.calcCalories, 0),
      protein: allLogs.reduce((s, l) => s + Number(l.calcProtein ?? 0), 0),
      carbs: allLogs.reduce((s, l) => s + Number(l.calcCarbs ?? 0), 0),
      fat: allLogs.reduce((s, l) => s + Number(l.calcFat ?? 0), 0),
    };

    return {
      date: dateIso,
      goal: goal
        ? {
            dailyCalorieGoal: goal.dailyCalorieGoal,
            proteinGoalG: goal.proteinGoalG,
            carbsGoalG: goal.carbsGoalG,
            fatGoalG: goal.fatGoalG,
            waterGoalMl: goal.waterGoalMl,
          }
        : null,
      consumed,
      water: {
        totalMl: water.totalMl,
        goalMl: goal?.waterGoalMl ?? null,
      },
      meals,
    };
  }
}
