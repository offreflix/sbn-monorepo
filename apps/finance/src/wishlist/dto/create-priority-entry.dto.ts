import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreatePriorityEntryDto {
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  priority: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
