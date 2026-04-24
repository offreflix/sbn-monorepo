import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateMeasurementDto {
  @ApiProperty({ example: 75.5, minimum: 0, description: "Peso em kg" })
  @IsNumber()
  @Min(0)
  weightKg: number;

  @ApiProperty({ example: "2024-01-15T08:00:00Z", required: false })
  @IsDateString()
  @IsOptional()
  measuredAt?: string;
}
