import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Patch,
  Delete,
  BadRequestException,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from './dto/update-wishlist-item.dto';
import { CreatePriceEntryDto } from './dto/create-price-entry.dto';
import { CreatePriorityEntryDto } from './dto/create-priority-entry.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  create(
    @Body() body: CreateWishlistItemDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.create({ ...body, userId });
  }

  @Get()
  findAll(
    @Headers('x-user-id') userId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.findAll(userId, { status, priority });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateWishlistItemDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.update(id, userId, body);
  }

  @Patch(':id/purchase')
  markAsPurchased(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.markAsPurchased(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.remove(id, userId);
  }

  // ── Price Entries ──────────────────────────────────────────────────────────

  @Post(':id/prices')
  createPriceEntry(
    @Param('id') id: string,
    @Body() body: CreatePriceEntryDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.createPriceEntry(userId, id, body);
  }

  @Get(':id/prices')
  findPriceEntries(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.findPriceEntries(userId, id);
  }

  @Delete(':id/prices/:entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePriceEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.removePriceEntry(userId, id, entryId);
  }

  // ── Priority Entries ───────────────────────────────────────────────────────

  @Post(':id/priorities')
  createPriorityEntry(
    @Param('id') id: string,
    @Body() body: CreatePriorityEntryDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.createPriorityEntry(userId, id, body);
  }

  @Get(':id/priorities')
  findPriorityEntries(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.findPriorityEntries(userId, id);
  }

  @Delete(':id/priorities/:entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePriorityEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.removePriorityEntry(userId, id, entryId);
  }
}
