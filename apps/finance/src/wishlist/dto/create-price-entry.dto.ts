import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsDateString,
  Min,
  IsInt,
  ValidateIf,
} from 'class-validator';

export class CreatePriceEntryDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cashPrice?: number;

  @IsInt()
  @Min(2)
  @ValidateIf(
    (o) => o.installmentCount !== undefined || o.installmentValue !== undefined,
  )
  @IsOptional()
  installmentCount?: number;

  @IsNumber()
  @Min(0.01)
  @ValidateIf(
    (o) => o.installmentCount !== undefined || o.installmentValue !== undefined,
  )
  @IsOptional()
  installmentValue?: number;

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
