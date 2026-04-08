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
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  create(
    @Body() dto: CreateMeasurementDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.measurementsService.create(userId, dto);
  }

  @Get()
  findAll(
    @Headers('x-user-id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.measurementsService.findByDateRange(userId, startDate, endDate);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.measurementsService.remove(id, userId);
  }
}
