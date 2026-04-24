import { ApiProperty } from "@nestjs/swagger";

export class MealLogResponseDto {
  @ApiProperty({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
  id: string;

  @ApiProperty({ example: "uuid-user" })
  userId: string;

  @ApiProperty({ example: "uuid-food", nullable: true })
  foodId: string | null;

  @ApiProperty({ example: "lunch" })
  mealType: string;

  @ApiProperty({ example: "2024-01-15" })
  loggedAtDate: string;

  @ApiProperty({ example: 150 })
  amountConsumed: number;

  @ApiProperty({ example: "g" })
  unitConsumed: string;

  @ApiProperty({ example: 195 })
  calcCalories: number;

  @ApiProperty({ example: 3.9, nullable: true })
  calcProtein: number | null;

  @ApiProperty({ example: 42.15, nullable: true })
  calcCarbs: number | null;

  @ApiProperty({ example: 0.3, nullable: true })
  calcFat: number | null;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  createdAt: string;
}

class MealGroupDto {
  @ApiProperty({ type: [MealLogResponseDto] })
  breakfast: MealLogResponseDto[];

  @ApiProperty({ type: [MealLogResponseDto] })
  lunch: MealLogResponseDto[];

  @ApiProperty({ type: [MealLogResponseDto] })
  dinner: MealLogResponseDto[];

  @ApiProperty({ type: [MealLogResponseDto] })
  snack: MealLogResponseDto[];
}

export class MealLogsGroupedResponseDto extends MealGroupDto {}
