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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';

@ApiTags('Wallets')
@ApiHeader({
  name: 'x-user-id',
  required: true,
  description: 'ID do usuário (definido pelo orchestrator)',
})
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar carteira' })
  @ApiResponse({ status: 201, description: 'Carteira criada', type: WalletResponseDto })
  create(@Body() body: CreateWalletDto, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.walletsService.create({ ...body, userId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar carteiras do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de carteiras', type: [WalletResponseDto] })
  findAll(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.walletsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar carteira por ID' })
  @ApiParam({ name: 'id', description: 'ID da carteira' })
  @ApiResponse({ status: 200, description: 'Carteira encontrada', type: WalletResponseDto })
  @ApiResponse({ status: 404, description: 'Carteira não encontrada' })
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.walletsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar carteira' })
  @ApiParam({ name: 'id', description: 'ID da carteira' })
  @ApiResponse({ status: 200, description: 'Carteira atualizada', type: WalletResponseDto })
  @ApiResponse({ status: 404, description: 'Carteira não encontrada' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateWalletDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.walletsService.update(id, userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir carteira' })
  @ApiParam({ name: 'id', description: 'ID da carteira' })
  @ApiResponse({ status: 200, description: 'Carteira excluída' })
  @ApiResponse({ status: 404, description: 'Carteira não encontrada' })
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.walletsService.remove(id, userId);
  }
}
