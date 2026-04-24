import { ApiProperty } from "@nestjs/swagger";

class NutritionGoalDto {
  @ApiProperty({ example: 2000 })
  dailyCalorieGoal: number;

  @ApiProperty({ example: 150 })
  proteinGoalG: number;

  @ApiProperty({ example: 250 })
  carbsGoalG: number;

  @ApiProperty({ example: 65 })
  fatGoalG: number;

  @ApiProperty({ example: 2000 })
  waterGoalMl: number;
}

class NutritionConsumedDto {
  @ApiProperty({ example: 1450 })
  calories: number;

  @ApiProperty({ example: 98.5 })
  protein: number;

  @ApiProperty({ example: 180.2 })
  carbs: number;

  @ApiProperty({ example: 42.1 })
  fat: number;
}

class WaterSummaryDto {
  @ApiProperty({ example: 1500 })
  totalMl: number;

  @ApiProperty({ example: 2000, nullable: true })
  goalMl: number | null;
}

export class HealthSummaryResponseDto {
  @ApiProperty({ example: "2024-01-15" })
  date: string;

  @ApiProperty({ type: NutritionGoalDto, nullable: true })
  goal: NutritionGoalDto | null;

  @ApiProperty({ type: NutritionConsumedDto })
  consumed: NutritionConsumedDto;

  @ApiProperty({ type: WaterSummaryDto })
  water: WaterSummaryDto;

  @ApiProperty({
    description:
      "Refeições agrupadas por tipo (breakfast, lunch, dinner, snack)",
  })
  meals: object;
}
