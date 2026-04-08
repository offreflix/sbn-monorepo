import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateMeasurementDto {
  @IsNumber()
  @Min(0)
  weightKg: number;

  @IsDateString()
  @IsOptional()
  measuredAt?: string;
}
