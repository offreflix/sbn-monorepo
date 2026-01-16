import { Controller, Get, Query, Headers } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @Headers('user-id') userId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.dashboardService.getSummary(
      userId,
      parseInt(month),
      parseInt(year),
    );
  }

  @Get('categories')
  async getCategories(
    @Headers('user-id') userId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.dashboardService.getCategories(
      userId,
      parseInt(month),
      parseInt(year),
    );
  }
}
