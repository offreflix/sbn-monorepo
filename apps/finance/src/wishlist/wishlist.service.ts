import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from './dto/update-wishlist-item.dto';
import { CreatePriceEntryDto } from './dto/create-price-entry.dto';
import { CreatePriorityEntryDto } from './dto/create-priority-entry.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    name: string;
    description?: string;
    price?: number;
    installmentCount?: number;
    installmentValue?: number;
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
        installmentCount: data.installmentCount ?? null,
        installmentValue: data.installmentValue ?? null,
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

  async findAll(
    userId: string,
    filters?: { status?: string; priority?: string },
  ) {
    return this.prisma.wishlistItem.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.priority ? { priority: filters.priority } : {}),
      },
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

    return this.prisma.wishlistItem.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === 'PURCHASED' ? { purchasedAt: new Date() } : {}),
      },
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

  // ── Price Entries ──────────────────────────────────────────────────────────

  async createPriceEntry(
    userId: string,
    itemId: string,
    dto: CreatePriceEntryDto,
  ) {
    await this.findOne(itemId, userId); // Verifica propriedade

    const cashPrice = dto.cashPrice ?? dto.price;

    return this.prisma.wishlistPriceEntry.create({
      data: {
        wishlistItemId: itemId,
        price: cashPrice,
        cashPrice,
        installmentCount: dto.installmentCount ?? null,
        installmentValue: dto.installmentValue ?? null,
        currency: dto.currency || 'BRL',
        store: dto.store,
        storeUrl: dto.storeUrl,
        date: new Date(dto.date),
        notes: dto.notes,
      },
    });
  }

  async findPriceEntries(userId: string, itemId: string) {
    await this.findOne(itemId, userId); // Verifica propriedade

    return this.prisma.wishlistPriceEntry.findMany({
      where: { wishlistItemId: itemId },
      orderBy: { date: 'asc' },
    });
  }

  async removePriceEntry(userId: string, itemId: string, entryId: string) {
    // Verifica propriedade do item pai
    const item = await this.prisma.wishlistItem.findFirst({
      where: { id: itemId, deletedAt: null },
    });
    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }
    if (item.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const entry = await this.prisma.wishlistPriceEntry.findFirst({
      where: { id: entryId, wishlistItemId: itemId },
    });
    if (!entry) {
      throw new NotFoundException('Price entry not found');
    }

    return this.prisma.wishlistPriceEntry.delete({ where: { id: entryId } });
  }

  // ── Priority Entries ───────────────────────────────────────────────────────

  async createPriorityEntry(
    userId: string,
    itemId: string,
    dto: CreatePriorityEntryDto,
  ) {
    await this.findOne(itemId, userId); // Verifica propriedade

    return this.prisma.wishlistPriorityEntry.create({
      data: {
        wishlistItemId: itemId,
        priority: dto.priority,
        date: new Date(dto.date),
        notes: dto.notes,
      },
    });
  }

  async findPriorityEntries(userId: string, itemId: string) {
    await this.findOne(itemId, userId); // Verifica propriedade

    return this.prisma.wishlistPriorityEntry.findMany({
      where: { wishlistItemId: itemId },
      orderBy: { date: 'asc' },
    });
  }

  async removePriorityEntry(userId: string, itemId: string, entryId: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { id: itemId, deletedAt: null },
    });
    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }
    if (item.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const entry = await this.prisma.wishlistPriorityEntry.findFirst({
      where: { id: entryId, wishlistItemId: itemId },
    });
    if (!entry) {
      throw new NotFoundException('Priority entry not found');
    }

    return this.prisma.wishlistPriorityEntry.delete({ where: { id: entryId } });
  }
}
