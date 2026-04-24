import { ApiProperty } from '@nestjs/swagger';

export class WaterLogResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'uuid-user' })
  userId: string;

  @ApiProperty({ example: 300 })
  volumeMl: number;

  @ApiProperty({ example: '2024-01-15' })
  loggedDate: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: string;
}
