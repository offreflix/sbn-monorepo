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
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  installments?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  installmentNumber?: number; // Usually calculated, but can be passed? Service accepts it.

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  totalInstallments?: number;

  @IsUUID()
  @IsOptional()
  recurrenceId?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  frequency?: string;
}
