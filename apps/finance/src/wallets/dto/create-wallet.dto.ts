import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsOptional()
  balance?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  invoiceClosingDay?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  invoiceDueDay?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
