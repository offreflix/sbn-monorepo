import { ApiProperty } from "@nestjs/swagger";

export class GoalResponseDto {
  @ApiProperty({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
  id: string;

  @ApiProperty({ example: "uuid-user" })
  userId: string;

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

  @ApiProperty({ example: "2024-01-01" })
  activeFrom: string;

  @ApiProperty({ example: "2024-01-01T00:00:00Z" })
  createdAt: string;

  @ApiProperty({ example: "2024-01-01T00:00:00Z" })
  updatedAt: string;
}
