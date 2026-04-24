import {
  IsBoolean,
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

export enum TransactionType {
  Receita = 'Receita',
  Despesa = 'Despesa',
}

export enum TransactionStatus {
  Pendente = 'Pendente',
  Pago = 'Pago',
  Cancelado = 'Cancelado',
}

export class CreateTransactionDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa7' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 50.0, minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'Supermercado', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.Despesa })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    enum: TransactionStatus,
    example: TransactionStatus.Pago,
    required: false,
  })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiProperty({
    example: 12,
    minimum: 1,
    required: false,
    description: 'Número de parcelas',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  installments?: number;

  @ApiProperty({
    example: 1,
    minimum: 1,
    required: false,
    description: 'Número da parcela atual',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  installmentNumber?: number;

  @ApiProperty({
    example: 12,
    minimum: 1,
    required: false,
    description: 'Total de parcelas',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  totalInstallments?: number;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  recurrenceId?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({ example: 'MONTHLY', required: false })
  @IsString()
  @IsOptional()
  frequency?: string;
}
