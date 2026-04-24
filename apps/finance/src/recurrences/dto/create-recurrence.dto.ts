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
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum RecurrenceFrequency {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
}

export class CreateRecurrenceDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa7' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 150.0, minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'Despesa', description: 'Despesa ou Receita' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    enum: RecurrenceFrequency,
    example: RecurrenceFrequency.MONTHLY,
  })
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 'Netflix', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'America/Sao_Paulo', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;
}
