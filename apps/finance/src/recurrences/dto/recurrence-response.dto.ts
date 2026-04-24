import { ApiProperty } from '@nestjs/swagger';

export class RecurrenceResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'uuid-user' })
  userId: string;

  @ApiProperty({ example: 'uuid-wallet' })
  walletId: string;

  @ApiProperty({ example: 'uuid-category' })
  categoryId: string;

  @ApiProperty({ example: 150.0 })
  amount: number;

  @ApiProperty({ example: 'BRL' })
  currency: string;

  @ApiProperty({ example: 'Netflix', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'Despesa' })
  type: string;

  @ApiProperty({ example: 'MONTHLY' })
  frequency: string;

  @ApiProperty({ example: 'America/Sao_Paulo' })
  timezone: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  startDate: string;

  @ApiProperty({ example: '2024-12-31T00:00:00Z', nullable: true })
  endDate: string | null;

  @ApiProperty({ example: '2024-03-01T00:00:00Z', nullable: true })
  lastGenerated: string | null;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: string;
}
