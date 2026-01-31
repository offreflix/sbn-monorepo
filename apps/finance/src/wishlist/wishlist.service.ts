import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from './dto/update-wishlist-item.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    url?: string;
    imageUrl?: string;
    priority?: string;
    status?: string;
    tags?: string[];
    notes?: string;
  }) {
    return this.prisma.wishlistItem.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency || 'BRL',
        url: data.url,
        imageUrl: data.imageUrl,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'WISHED',
        tags: data.tags || [],
        notes: data.notes,
      },
    });
  }

  async findAll(userId: string, filters?: { status?: string; priority?: string }) {
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    return this.prisma.wishlistItem.findMany({
      where,
      orderBy: [
        { priority: 'desc' }, // HIGH, MEDIUM, LOW
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }
    return item;
  }

  async update(id: string, userId: string, data: UpdateWishlistItemDto) {
    await this.findOne(id, userId); // Verify ownership

    const updateData: any = { ...data };
    delete updateData.userId;
    delete updateData.id;

    // If status is being set to PURCHASED, set purchasedAt
    if (data.status === 'PURCHASED' && !updateData.purchasedAt) {
      updateData.purchasedAt = new Date();
    }

    return this.prisma.wishlistItem.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Verify ownership

    // Logical delete (soft delete)
    return this.prisma.wishlistItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async markAsPurchased(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.wishlistItem.update({
      where: { id },
      data: {
        status: 'PURCHASED',
        purchasedAt: new Date(),
      },
    });
  }
}
