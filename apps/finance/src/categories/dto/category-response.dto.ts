import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'uuid-user', nullable: true })
  userId: string | null;

  @ApiProperty({ example: 'Alimentação' })
  name: string;

  @ApiProperty({ example: 'Despesa' })
  type: string;

  @ApiProperty({ example: '🍔', nullable: true })
  icon: string | null;

  @ApiProperty({ example: '#FF5733', nullable: true })
  color: string | null;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: string;
}
