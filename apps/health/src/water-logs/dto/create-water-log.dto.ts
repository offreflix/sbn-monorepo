import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateWaterLogDto {
  @IsInt()
  @Min(1)
  volumeMl: number;

  @IsDateString()
  @IsOptional()
  loggedDate?: string;
}
