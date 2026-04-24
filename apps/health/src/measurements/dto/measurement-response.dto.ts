import { ApiProperty } from '@nestjs/swagger';

export class MeasurementResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'uuid-user' })
  userId: string;

  @ApiProperty({ example: 75.5, nullable: true })
  weightKg: number | null;

  @ApiProperty({ example: '2024-01-15' })
  measuredAt: string;

  @ApiProperty({ example: '2024-01-15T08:00:00Z' })
  createdAt: string;
}
