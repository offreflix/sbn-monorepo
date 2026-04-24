import {
  Controller,
  Get,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectionsService } from './projections.service';
import { ProjectionTimelineItemDto } from './dto/projection-response.dto';

@ApiTags('Projections')
@ApiHeader({
  name: 'x-user-id',
  required: true,
  description: 'ID do usuário (definido pelo orchestrator)',
})
@Controller('projections')
export class ProjectionsController {
  constructor(private readonly projectionsService: ProjectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Projeção financeira futura' })
  @ApiQuery({
    name: 'months',
    description: 'Número de meses a projetar (padrão: 6)',
    required: false,
    example: 6,
  })
  @ApiResponse({
    status: 200,
    description: 'Projeção mês a mês com base nas recorrências',
    type: [ProjectionTimelineItemDto],
  })
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
