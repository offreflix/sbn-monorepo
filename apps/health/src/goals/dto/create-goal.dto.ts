import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateGoalDto {
  @IsInt()
  @Min(1)
  dailyCalorieGoal: number;

  @IsInt()
  @Min(0)
  proteinGoalG: number;

  @IsInt()
  @Min(0)
  carbsGoalG: number;

  @IsInt()
  @Min(0)
  fatGoalG: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  waterGoalMl?: number;

  @IsDateString()
  @IsOptional()
  activeFrom?: string;
}
