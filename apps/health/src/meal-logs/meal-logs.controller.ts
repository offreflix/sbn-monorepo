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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { MealLogsService } from "./meal-logs.service";
import { CreateMealLogDto } from "./dto/create-meal-log.dto";
import {
  MealLogResponseDto,
  MealLogsGroupedResponseDto,
} from "./dto/meal-log-response.dto";

@ApiTags("Meal Logs")
@ApiHeader({
  name: "x-user-id",
  required: true,
  description: "ID do usuário (definido pelo orchestrator)",
})
@Controller("meal-logs")
export class MealLogsController {
  constructor(private readonly mealLogsService: MealLogsService) {}

  @Post()
  @ApiOperation({ summary: "Registrar refeição" })
  @ApiResponse({ status: 201, description: "Refeição registrada", type: MealLogResponseDto })
  create(@Body() dto: CreateMealLogDto, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.mealLogsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar refeições por data" })
  @ApiQuery({
    name: "date",
    required: false,
    description: "Data no formato YYYY-MM-DD (padrão: hoje)",
    example: "2024-01-15",
  })
  @ApiResponse({ status: 200, description: "Lista de refeições do dia", type: MealLogsGroupedResponseDto })
  findByDate(
    @Headers("x-user-id") userId: string,
    @Query("date") date?: string,
  ) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.mealLogsService.findByDate(userId, date);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover registro de refeição" })
  @ApiParam({ name: "id", description: "ID do registro de refeição" })
  @ApiResponse({ status: 200, description: "Registro removido" })
  @ApiResponse({ status: 404, description: "Registro não encontrado" })
  remove(@Param("id") id: string, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.mealLogsService.remove(id, userId);
  }
}
