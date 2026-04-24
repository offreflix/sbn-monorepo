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
import { MeasurementsService } from "./measurements.service";
import { CreateMeasurementDto } from "./dto/create-measurement.dto";
import { MeasurementResponseDto } from "./dto/measurement-response.dto";

@ApiTags("Measurements")
@ApiHeader({
  name: "x-user-id",
  required: true,
  description: "ID do usuário (definido pelo orchestrator)",
})
@Controller("measurements")
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  @ApiOperation({ summary: "Registrar medição de peso" })
  @ApiResponse({ status: 201, description: "Medição registrada", type: MeasurementResponseDto })
  create(
    @Body() dto: CreateMeasurementDto,
    @Headers("x-user-id") userId: string,
  ) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.measurementsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar medições por período" })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Data inicial (YYYY-MM-DD)",
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "Data final (YYYY-MM-DD)",
    example: "2024-01-31",
  })
  @ApiResponse({ status: 200, description: "Lista de medições", type: [MeasurementResponseDto] })
  findAll(
    @Headers("x-user-id") userId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.measurementsService.findByDateRange(userId, startDate, endDate);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover medição" })
  @ApiParam({ name: "id", description: "ID da medição" })
  @ApiResponse({ status: 200, description: "Medição removida" })
  @ApiResponse({ status: 404, description: "Medição não encontrada" })
  remove(@Param("id") id: string, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.measurementsService.remove(id, userId);
  }
}
