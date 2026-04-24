import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'Minha API Key' })
  name: string;

  @ApiProperty({ example: 'sbn_abc123' })
  keyPrefix: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-04-22T12:00:00Z', nullable: true })
  lastUsedAt: string | null;

  @ApiProperty({ example: '2026-12-31T00:00:00Z', nullable: true })
  expiresAt: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  createdAt: string;
}

export class CreateApiKeyResponseDto extends ApiKeyResponseDto {
  @ApiProperty({
    example: 'sbn_abc123_xxxxxxxxxxxxxx',
    description: 'Chave completa — exibida apenas na criação',
  })
  key: string;
}
