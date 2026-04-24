import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentação' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Despesa', description: 'Despesa ou Receita' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '🍔', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ example: '#FF5733', required: false })
  @IsString()
  @IsOptional()
  color?: string;
}
