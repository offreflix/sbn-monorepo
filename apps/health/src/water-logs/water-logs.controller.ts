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
import { WaterLogsService } from './water-logs.service';
import { CreateWaterLogDto } from './dto/create-water-log.dto';

@Controller('water-logs')
export class WaterLogsController {
  constructor(private readonly waterLogsService: WaterLogsService) {}

  @Post()
  create(
    @Body() dto: CreateWaterLogDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.waterLogsService.create(userId, dto);
  }

  @Get()
  findByDate(
    @Headers('x-user-id') userId: string,
    @Query('date') date?: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.waterLogsService.findByDate(userId, date);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.waterLogsService.remove(id, userId);
  }
}
