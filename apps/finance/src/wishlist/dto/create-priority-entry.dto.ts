import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriorityEntryDto {
  @ApiProperty({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH'] })
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  priority: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Preciso para o trabalho', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
