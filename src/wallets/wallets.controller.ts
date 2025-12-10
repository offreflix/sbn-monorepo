import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { WalletsService } from './wallets.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Body() body: any, @Headers('x-user-id') userId: string) {
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
}
