import {
  Controller,
  Get,
  Headers,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  getSummary(
    @Headers('x-user-id') userId: string,
    @Query('date') date?: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.summaryService.getSummary(userId, date);
  }
}
