import { ApiProperty } from '@nestjs/swagger';

class DashboardCardsDto {
  @ApiProperty({ example: 3500.00 })
  balance: number;

  @ApiProperty({ example: 800.00 })
  currentInvoice: number;

  @ApiProperty({ example: 400.00 })
  nextInvoice: number;

  @ApiProperty({ example: 1200.00 })
  totalInvoices: number;
}

class DashboardOverviewDto {
  @ApiProperty({ example: 5000.00 })
  income: number;

  @ApiProperty({ example: 1500.00 })
  expense: number;

  @ApiProperty({ example: 3500.00 })
  balance: number;
}

export class DashboardSummaryResponseDto {
  @ApiProperty({ type: DashboardCardsDto })
  cards: DashboardCardsDto;

  @ApiProperty({ type: DashboardOverviewDto })
  overview: DashboardOverviewDto;
}

class CategoryAmountDto {
  @ApiProperty({ example: 'Alimentação' })
  name: string;

  @ApiProperty({ example: 450.00 })
  value: number;

  @ApiProperty({ example: 30.0, description: 'Percentual do total' })
  percentage: number;
}

class DashboardCategoriesGroupDto {
  @ApiProperty({ type: [CategoryAmountDto] })
  income: CategoryAmountDto[];

  @ApiProperty({ type: [CategoryAmountDto] })
  expense: CategoryAmountDto[];
}

export class DashboardCategoriesResponseDto extends DashboardCategoriesGroupDto {}

class DayAggregateDto {
  @ApiProperty({ example: 15 })
  day: number;

  @ApiProperty({ example: 1000.00 })
  income: number;

  @ApiProperty({ example: 250.00 })
  expense: number;
}

class MonthOverviewDto {
  @ApiProperty({ example: 1, description: 'Mês (1-12)' })
  month: number;

  @ApiProperty({ example: 5000.00 })
  income: number;

  @ApiProperty({ example: 1500.00 })
  expense: number;

  @ApiProperty({ example: 3500.00 })
  balance: number;

  @ApiProperty({ type: [DayAggregateDto] })
  days: DayAggregateDto[];
}

export class DashboardYearResponseDto {
  @ApiProperty({ example: 2024 })
  year: number;

  @ApiProperty({ type: [MonthOverviewDto] })
  months: MonthOverviewDto[];
}
