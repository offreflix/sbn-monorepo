import { IsDateString, IsInt, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGoalDto {
  @ApiProperty({ example: 2000, minimum: 1 })
  @IsInt()
  @Min(1)
  dailyCalorieGoal: number;

  @ApiProperty({
    example: 150,
    minimum: 0,
    description: "Meta de proteína em gramas",
  })
  @IsInt()
  @Min(0)
  proteinGoalG: number;

  @ApiProperty({
    example: 250,
    minimum: 0,
    description: "Meta de carboidratos em gramas",
  })
  @IsInt()
  @Min(0)
  carbsGoalG: number;

  @ApiProperty({
    example: 65,
    minimum: 0,
    description: "Meta de gordura em gramas",
  })
  @IsInt()
  @Min(0)
  fatGoalG: number;

  @ApiProperty({
    example: 2000,
    minimum: 0,
    required: false,
    description: "Meta de água em ml",
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  waterGoalMl?: number;

  @ApiProperty({ example: "2024-01-01", required: false })
  @IsDateString()
  @IsOptional()
  activeFrom?: string;
}
