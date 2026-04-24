import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFoodDto {
  @ApiProperty({ example: "Arroz branco cozido" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "Tio João", required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({
    example: 100,
    minimum: 0.01,
    description: "Tamanho da porção",
  })
  @IsNumber()
  @Min(0.01)
  servingSizeValue: number;

  @ApiProperty({
    example: "g",
    description: "Unidade da porção (g, ml, unidade)",
  })
  @IsString()
  @IsNotEmpty()
  servingSizeUnit: string;

  @ApiProperty({ example: 130, minimum: 0 })
  @IsInt()
  @Min(0)
  caloriesPerServing: number;

  @ApiProperty({ example: 2.6, minimum: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  proteinPerServing?: number;

  @ApiProperty({ example: 28.1, minimum: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  carbsPerServing?: number;

  @ApiProperty({ example: 0.2, minimum: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  fatPerServing?: number;
}
