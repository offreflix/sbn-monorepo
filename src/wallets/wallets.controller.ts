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
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Body() body: CreateWalletDto, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.walletsService.create({ ...body, userId });
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.walletsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.walletsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateWalletDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.walletsService.update(id, userId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.walletsService.remove(id, userId);
  }
}
