import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({ example: 'Nubank' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'credit',
    description: 'checking, savings, credit, investment',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 1000.0, required: false })
  @IsNumber()
  @IsOptional()
  balance?: number;

  @ApiProperty({ example: 'BRL', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 5000.0, required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ example: 20, minimum: 1, maximum: 31, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  invoiceClosingDay?: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 31, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  invoiceDueDay?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
