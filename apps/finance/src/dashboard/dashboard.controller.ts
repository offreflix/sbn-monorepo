import {
  Controller,
  Get,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @Headers('x-user-id') userId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.dashboardService.getSummary(
      userId,
      parseInt(month),
      parseInt(year),
    );
  }

  @Get('categories')
  async getCategories(
    @Headers('x-user-id') userId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.dashboardService.getCategories(
      userId,
      parseInt(month),
      parseInt(year),
    );
  }
}
