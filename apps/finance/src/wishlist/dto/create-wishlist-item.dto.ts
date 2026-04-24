import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsUrl,
  IsEnum,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum Status {
  WISHED = 'WISHED',
  PURCHASED = 'PURCHASED',
  REMOVED = 'REMOVED',
}

export class CreateWishlistItemDto {
  @ApiProperty({ example: 'MacBook Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Notebook para trabalho', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 12999.99, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 12, minimum: 2, required: false })
  @IsInt()
  @Min(2)
  @IsOptional()
  installmentCount?: number;

  @ApiProperty({ example: 1083.33, minimum: 0.01, required: false })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  installmentValue?: number;

  @ApiProperty({ example: 'BRL', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'https://apple.com/macbook-pro', required: false })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiProperty({
    example: 'https://store.storeimages.cdn-apple.com/macbook.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ enum: Priority, example: Priority.HIGH, required: false })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiProperty({ enum: Status, example: Status.WISHED, required: false })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({
    example: ['tech', 'trabalho'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 'Aguardando promoção', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
