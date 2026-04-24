import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'uuid-user' })
  userId: string;

  @ApiProperty({ example: 'uuid-wallet' })
  walletId: string;

  @ApiProperty({ example: 'uuid-category' })
  categoryId: string;

  @ApiProperty({ example: 50.00 })
  amount: number;

  @ApiProperty({ example: 'BRL' })
  currency: string;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  date: string;

  @ApiProperty({ example: 'Supermercado', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'Pago' })
  status: string;

  @ApiProperty({ example: 'Despesa' })
  type: string;

  @ApiProperty({ example: [], type: [String] })
  tags: string[];

  @ApiProperty({ example: true })
  isPaid: boolean;

  @ApiProperty({ example: 1, nullable: true })
  installmentNumber: number | null;

  @ApiProperty({ example: 12, nullable: true })
  totalInstallments: number | null;

  @ApiProperty({ example: 'uuid-recurrence', nullable: true })
  recurrenceId: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: string;
}

export class TransactionSummaryResponseDto {
  @ApiProperty({ example: 3500.00, description: 'Saldo total em todas as carteiras' })
  totalBalance: number;

  @ApiProperty({ example: 5000.00 })
  totalIncome: number;

  @ApiProperty({ example: 1500.00 })
  totalExpenses: number;
}
