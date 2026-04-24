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
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriceEntryDto {
  @ApiProperty({ example: 299.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    example: 280.0,
    minimum: 0,
    required: false,
    description: 'Preço à vista',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cashPrice?: number;

  @ApiProperty({ example: 12, minimum: 2, required: false })
  @IsInt()
  @Min(2)
  @ValidateIf(
    (o) => o.installmentCount !== undefined || o.installmentValue !== undefined,
  )
  @IsOptional()
  installmentCount?: number;

  @ApiProperty({ example: 25.99, minimum: 0.01, required: false })
  @IsNumber()
  @Min(0.01)
  @ValidateIf(
    (o) => o.installmentCount !== undefined || o.installmentValue !== undefined,
  )
  @IsOptional()
  installmentValue?: number;

  @ApiProperty({ example: 'Amazon' })
  @IsString()
  @IsNotEmpty()
  store: string;

  @ApiProperty({ example: 'BRL', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    example: 'https://amazon.com.br/product/123',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  storeUrl?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Promoção relâmpago', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
