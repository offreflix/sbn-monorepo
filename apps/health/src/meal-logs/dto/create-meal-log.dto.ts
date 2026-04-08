import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export enum MealType {
  breakfast = 'breakfast',
  lunch = 'lunch',
  dinner = 'dinner',
  snack = 'snack',
}

export class CreateMealLogDto {
  @IsUUID()
  @IsNotEmpty()
  foodId: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsNumber()
  @Min(0.01)
  amountConsumed: number;

  @IsString()
  @IsNotEmpty()
  unitConsumed: string;

  @IsDateString()
  @IsOptional()
  loggedAtDate?: string;
}
