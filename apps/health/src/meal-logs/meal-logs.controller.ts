import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { MealLogsService } from './meal-logs.service';
import { CreateMealLogDto } from './dto/create-meal-log.dto';

@Controller('meal-logs')
export class MealLogsController {
  constructor(private readonly mealLogsService: MealLogsService) {}

  @Post()
  create(
    @Body() dto: CreateMealLogDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.mealLogsService.create(userId, dto);
  }

  @Get()
  findByDate(
    @Headers('x-user-id') userId: string,
    @Query('date') date?: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.mealLogsService.findByDate(userId, date);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.mealLogsService.remove(id, userId);
  }
}
