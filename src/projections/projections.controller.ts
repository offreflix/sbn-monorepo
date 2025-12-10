import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ProjectionsService } from './projections.service';

@Controller('projections')
export class ProjectionsController {
  constructor(private readonly projectionsService: ProjectionsService) {}

  @Get()
  getProjection(
    @Headers('x-user-id') userId: string,
    @Query('months') months: string,
  ) {
    return this.projectionsService.getProjection(
      userId,
      months ? parseInt(months) : 6,
    );
  }
}
