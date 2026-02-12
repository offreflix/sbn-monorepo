import {
  Controller,
  Get,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ProjectionsService } from './projections.service';

@Controller('projections')
export class ProjectionsController {
  constructor(private readonly projectionsService: ProjectionsService) {}

  @Get()
  getProjection(
    @Headers('x-user-id') userId: string,
    @Query('months') months: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.projectionsService.getProjection(
      userId,
      months ? parseInt(months) : 6,
    );
  }
}
