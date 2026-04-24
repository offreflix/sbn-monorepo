import { ApiProperty } from '@nestjs/swagger';

export class FoodResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'Arroz branco cozido' })
  name: string;

  @ApiProperty({ example: 'Tio João', nullable: true })
  brand: string | null;

  @ApiProperty({ example: 100 })
  servingSizeValue: number;

  @ApiProperty({ example: 'g' })
  servingSizeUnit: string;

  @ApiProperty({ example: 130 })
  caloriesPerServing: number;

  @ApiProperty({ example: 2.6, nullable: true })
  proteinPerServing: number | null;

  @ApiProperty({ example: 28.1, nullable: true })
  carbsPerServing: number | null;

  @ApiProperty({ example: 0.2, nullable: true })
  fatPerServing: number | null;

  @ApiProperty({ example: true })
  isCustom: boolean;

  @ApiProperty({ example: 'uuid-user', nullable: true })
  userId: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: string;
}
