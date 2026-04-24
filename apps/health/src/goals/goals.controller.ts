import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Patch,
  Delete,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
} from "@nestjs/swagger";
import { GoalsService } from "./goals.service";
import { CreateGoalDto } from "./dto/create-goal.dto";
import { UpdateGoalDto } from "./dto/update-goal.dto";
import { GoalResponseDto } from "./dto/goal-response.dto";

@ApiTags("Goals")
@ApiHeader({
  name: "x-user-id",
  required: true,
  description: "ID do usuário (definido pelo orchestrator)",
})
@Controller("goals")
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: "Criar meta nutricional" })
  @ApiResponse({
    status: 201,
    description: "Meta criada",
    type: GoalResponseDto,
  })
  create(@Body() dto: CreateGoalDto, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.goalsService.create(userId, dto);
  }

  @Get("current")
  @ApiOperation({ summary: "Obter meta nutricional ativa" })
  @ApiResponse({
    status: 200,
    description: "Meta ativa do usuário",
    type: GoalResponseDto,
  })
  @ApiResponse({ status: 404, description: "Nenhuma meta ativa encontrada" })
  findCurrent(@Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.goalsService.findCurrent(userId);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas as metas do usuário" })
  @ApiResponse({
    status: 200,
    description: "Lista de metas",
    type: [GoalResponseDto],
  })
  findAll(@Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.goalsService.findAll(userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar meta" })
  @ApiParam({ name: "id", description: "ID da meta" })
  @ApiResponse({
    status: 200,
    description: "Meta atualizada",
    type: GoalResponseDto,
  })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateGoalDto,
    @Headers("x-user-id") userId: string,
  ) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.goalsService.update(id, userId, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Excluir meta" })
  @ApiParam({ name: "id", description: "ID da meta" })
  @ApiResponse({ status: 200, description: "Meta excluída" })
  remove(@Param("id") id: string, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.goalsService.remove(id, userId);
  }
}
