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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from './dto/update-wishlist-item.dto';
import { CreatePriceEntryDto } from './dto/create-price-entry.dto';
import { CreatePriorityEntryDto } from './dto/create-priority-entry.dto';
import {
  WishlistItemResponseDto,
  WishlistPriceEntryResponseDto,
  WishlistPriorityEntryResponseDto,
} from './dto/wishlist-response.dto';

@ApiTags('Wishlist')
@ApiHeader({
  name: 'x-user-id',
  required: true,
  description: 'ID do usuário (definido pelo orchestrator)',
})
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Criar item na wishlist' })
  @ApiResponse({ status: 201, description: 'Item criado', type: WishlistItemResponseDto })
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
  @ApiOperation({ summary: 'Listar itens da wishlist' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por status (WISHED, PURCHASED, REMOVED)',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    description: 'Filtrar por prioridade (LOW, MEDIUM, HIGH)',
  })
  @ApiResponse({ status: 200, description: 'Lista de itens', type: [WishlistItemResponseDto] })
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
  @ApiOperation({ summary: 'Buscar item por ID' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiResponse({ status: 200, description: 'Item encontrado', type: WishlistItemResponseDto })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar item da wishlist' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiResponse({ status: 200, description: 'Item atualizado', type: WishlistItemResponseDto })
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
  @ApiOperation({ summary: 'Marcar item como comprado' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiResponse({ status: 200, description: 'Item marcado como comprado', type: WishlistItemResponseDto })
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
  @ApiOperation({ summary: 'Excluir item da wishlist' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiResponse({ status: 200, description: 'Item excluído' })
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.wishlistService.remove(id, userId);
  }

  // ── Price Entries ──────────────────────────────────────────────────────────

  @Post(':id/prices')
  @ApiOperation({ summary: 'Registrar entrada de preço para o item' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiResponse({ status: 201, description: 'Entrada de preço registrada', type: WishlistPriceEntryResponseDto })
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
  @ApiOperation({ summary: 'Listar histórico de preços do item' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiResponse({ status: 200, description: 'Histórico de preços', type: [WishlistPriceEntryResponseDto] })
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
  @ApiOperation({ summary: 'Remover entrada de preço' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiParam({ name: 'entryId', description: 'ID da entrada de preço' })
  @ApiResponse({ status: 204, description: 'Entrada de preço removida' })
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
  @ApiOperation({ summary: 'Registrar entrada de prioridade para o item' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiResponse({ status: 201, description: 'Entrada de prioridade registrada', type: WishlistPriorityEntryResponseDto })
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
  @ApiOperation({ summary: 'Listar histórico de prioridades do item' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiResponse({ status: 200, description: 'Histórico de prioridades', type: [WishlistPriorityEntryResponseDto] })
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
  @ApiOperation({ summary: 'Remover entrada de prioridade' })
  @ApiParam({ name: 'id', description: 'ID do item' })
  @ApiParam({ name: 'entryId', description: 'ID da entrada de prioridade' })
  @ApiResponse({ status: 204, description: 'Entrada de prioridade removida' })
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
