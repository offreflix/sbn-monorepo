import { ApiProperty } from '@nestjs/swagger';

export class ProjectionTimelineItemDto {
  @ApiProperty({ example: '2024-02-15' })
  date: string;

  @ApiProperty({ example: 2800.0, description: 'Saldo projetado nessa data' })
  balance: number;

  @ApiProperty({ example: 'Netflix (Recorrente)', nullable: true })
  event: string | null;

  @ApiProperty({ example: 150.0 })
  amount: number;
}
