import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsDateString,
  Min,
} from 'class-validator';

export class CreatePriceEntryDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  store: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsUrl()
  @IsOptional()
  storeUrl?: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
