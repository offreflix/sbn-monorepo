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
import { WaterLogsService } from "./water-logs.service";
import { CreateWaterLogDto } from "./dto/create-water-log.dto";
import { WaterLogResponseDto } from "./dto/water-log-response.dto";

@ApiTags("Water Logs")
@ApiHeader({
  name: "x-user-id",
  required: true,
  description: "ID do usuário (definido pelo orchestrator)",
})
@Controller("water-logs")
export class WaterLogsController {
  constructor(private readonly waterLogsService: WaterLogsService) {}

  @Post()
  @ApiOperation({ summary: "Registrar consumo de água" })
  @ApiResponse({ status: 201, description: "Consumo registrado", type: WaterLogResponseDto })
  create(@Body() dto: CreateWaterLogDto, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.waterLogsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar consumo de água por data" })
  @ApiQuery({
    name: "date",
    required: false,
    description: "Data no formato YYYY-MM-DD (padrão: hoje)",
    example: "2024-01-15",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de registros de água do dia",
    type: [WaterLogResponseDto],
  })
  findByDate(
    @Headers("x-user-id") userId: string,
    @Query("date") date?: string,
  ) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.waterLogsService.findByDate(userId, date);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover registro de água" })
  @ApiParam({ name: "id", description: "ID do registro" })
  @ApiResponse({ status: 200, description: "Registro removido" })
  @ApiResponse({ status: 404, description: "Registro não encontrado" })
  remove(@Param("id") id: string, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.waterLogsService.remove(id, userId);
  }
}
