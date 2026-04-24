import { ApiProperty } from '@nestjs/swagger';

export class WishlistItemResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'uuid-user' })
  userId: string;

  @ApiProperty({ example: 'MacBook Pro' })
  name: string;

  @ApiProperty({ example: 'Notebook para trabalho', nullable: true })
  description: string | null;

  @ApiProperty({ example: 12999.99, nullable: true })
  price: number | null;

  @ApiProperty({ example: 12, nullable: true })
  installmentCount: number | null;

  @ApiProperty({ example: 1083.33, nullable: true })
  installmentValue: number | null;

  @ApiProperty({ example: 'BRL' })
  currency: string;

  @ApiProperty({ example: 'https://apple.com/macbook-pro', nullable: true })
  url: string | null;

  @ApiProperty({
    example: 'https://store.storeimages.cdn-apple.com/macbook.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ example: 'HIGH' })
  priority: string;

  @ApiProperty({ example: 'WISHED' })
  status: string;

  @ApiProperty({ example: ['tech', 'trabalho'], type: [String] })
  tags: string[];

  @ApiProperty({ example: 'Aguardando promoção', nullable: true })
  notes: string | null;

  @ApiProperty({ example: null, nullable: true })
  purchasedAt: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: string;
}

export class WishlistPriceEntryResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'uuid-wishlist-item' })
  wishlistItemId: string;

  @ApiProperty({ example: 299.99 })
  price: number;

  @ApiProperty({ example: 280.0, nullable: true })
  cashPrice: number | null;

  @ApiProperty({ example: 12, nullable: true })
  installmentCount: number | null;

  @ApiProperty({ example: 25.99, nullable: true })
  installmentValue: number | null;

  @ApiProperty({ example: 'BRL' })
  currency: string;

  @ApiProperty({ example: 'Amazon' })
  store: string;

  @ApiProperty({ example: 'https://amazon.com.br/product/123', nullable: true })
  storeUrl: string | null;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  date: string;

  @ApiProperty({ example: 'Promoção relâmpago', nullable: true })
  notes: string | null;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  createdAt: string;
}

export class WishlistPriorityEntryResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'uuid-wishlist-item' })
  wishlistItemId: string;

  @ApiProperty({ example: 'HIGH' })
  priority: string;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  date: string;

  @ApiProperty({ example: 'Preciso para o trabalho', nullable: true })
  notes: string | null;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  createdAt: string;
}
