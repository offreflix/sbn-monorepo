import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Minha API Key' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
