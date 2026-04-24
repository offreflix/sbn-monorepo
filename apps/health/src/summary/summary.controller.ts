import {
  Controller,
  Get,
  Headers,
  Query,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiQuery,
} from "@nestjs/swagger";
import { SummaryService } from "./summary.service";
import { HealthSummaryResponseDto } from "./dto/summary-response.dto";

@ApiTags("Summary")
@ApiHeader({
  name: "x-user-id",
  required: true,
  description: "ID do usuário (definido pelo orchestrator)",
})
@Controller("summary")
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @ApiOperation({ summary: "Resumo nutricional do dia" })
  @ApiQuery({
    name: "date",
    required: false,
    description: "Data no formato YYYY-MM-DD (padrão: hoje)",
    example: "2024-01-15",
  })
  @ApiResponse({
    status: 200,
    description: "Total de calorias, macros e água consumidos vs metas",
    type: HealthSummaryResponseDto,
  })
  getSummary(
    @Headers("x-user-id") userId: string,
    @Query("date") date?: string,
  ) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.summaryService.getSummary(userId, date);
  }
}
