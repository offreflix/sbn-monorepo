import { IsDateString, IsInt, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateWaterLogDto {
  @ApiProperty({ example: 300, minimum: 1, description: "Volume em ml" })
  @IsInt()
  @Min(1)
  volumeMl: number;

  @ApiProperty({ example: "2024-01-15", required: false })
  @IsDateString()
  @IsOptional()
  loggedDate?: string;
}
