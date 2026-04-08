import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Patch,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Post()
  create(
    @Body() dto: CreateFoodDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.foodsService.create(userId, dto);
  }

  @Get()
  findAll(
    @Headers('x-user-id') userId: string,
    @Query('search') search?: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.foodsService.findAll(userId, search);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.foodsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFoodDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.foodsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.foodsService.remove(id, userId);
  }
}
