import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFoodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Min(0.01)
  servingSizeValue: number;

  @IsString()
  @IsNotEmpty()
  servingSizeUnit: string;

  @IsInt()
  @Min(0)
  caloriesPerServing: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  proteinPerServing?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  carbsPerServing?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fatPerServing?: number;
}
