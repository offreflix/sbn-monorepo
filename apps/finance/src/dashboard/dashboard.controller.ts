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
import { DashboardService } from './dashboard.service';
import {
  DashboardSummaryResponseDto,
  DashboardCategoriesResponseDto,
  DashboardYearResponseDto,
} from './dto/dashboard-response.dto';

@ApiTags('Dashboard')
@ApiHeader({
  name: 'x-user-id',
  required: true,
  description: 'ID do usuário (definido pelo orchestrator)',
})
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo financeiro do mês' })
  @ApiQuery({ name: 'month', description: 'Mês (1-12)', example: 1 })
  @ApiQuery({ name: 'year', description: 'Ano', example: 2024 })
  @ApiResponse({
    status: 200,
    description: 'Resumo com receitas, despesas e saldo',
    type: DashboardSummaryResponseDto,
  })
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
  @ApiOperation({ summary: 'Gastos por categoria no mês' })
  @ApiQuery({ name: 'month', description: 'Mês (1-12)', example: 1 })
  @ApiQuery({ name: 'year', description: 'Ano', example: 2024 })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias com totais',
    type: DashboardCategoriesResponseDto,
  })
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

  @Get('year')
  @ApiOperation({ summary: 'Visão geral do ano' })
  @ApiQuery({
    name: 'year',
    description: 'Ano (padrão: ano atual)',
    required: false,
    example: 2024,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados mensais do ano inteiro',
    type: DashboardYearResponseDto,
  })
  async getYearOverview(
    @Headers('x-user-id') userId: string,
    @Query('year') year?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    return this.dashboardService.getYearOverview(userId, targetYear);
  }
}
