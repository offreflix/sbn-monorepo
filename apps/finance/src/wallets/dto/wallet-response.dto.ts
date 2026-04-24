import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'uuid-user' })
  userId: string;

  @ApiProperty({ example: 'Nubank' })
  name: string;

  @ApiProperty({ example: 'credit' })
  type: string;

  @ApiProperty({ example: 1500.00 })
  balance: number;

  @ApiProperty({ example: 'BRL' })
  currency: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 20, nullable: true })
  invoiceClosingDay: number | null;

  @ApiProperty({ example: 10, nullable: true })
  invoiceDueDay: number | null;

  @ApiProperty({ example: 5000.00, nullable: true })
  limit: number | null;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: string;
}
