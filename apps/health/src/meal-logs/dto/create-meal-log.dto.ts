import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum MealType {
  breakfast = "breakfast",
  lunch = "lunch",
  dinner = "dinner",
  snack = "snack",
}

export class CreateMealLogDto {
  @ApiProperty({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
  @IsUUID()
  @IsNotEmpty()
  foodId: string;

  @ApiProperty({ enum: MealType, example: MealType.lunch })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({
    example: 150,
    minimum: 0.01,
    description: "Quantidade consumida",
  })
  @IsNumber()
  @Min(0.01)
  amountConsumed: number;

  @ApiProperty({
    example: "g",
    description: "Unidade consumida (g, ml, unidade)",
  })
  @IsString()
  @IsNotEmpty()
  unitConsumed: string;

  @ApiProperty({ example: "2024-01-15", required: false })
  @IsDateString()
  @IsOptional()
  loggedAtDate?: string;
}
