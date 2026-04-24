import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Patch,
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
import { FoodsService } from "./foods.service";
import { CreateFoodDto } from "./dto/create-food.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { FoodResponseDto } from "./dto/food-response.dto";

@ApiTags("Foods")
@ApiHeader({
  name: "x-user-id",
  required: true,
  description: "ID do usuário (definido pelo orchestrator)",
})
@Controller("foods")
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Post()
  @ApiOperation({ summary: "Criar alimento" })
  @ApiResponse({
    status: 201,
    description: "Alimento criado",
    type: FoodResponseDto,
  })
  create(@Body() dto: CreateFoodDto, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.foodsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar alimentos do usuário" })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Buscar por nome do alimento",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de alimentos",
    type: [FoodResponseDto],
  })
  findAll(
    @Headers("x-user-id") userId: string,
    @Query("search") search?: string,
  ) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.foodsService.findAll(userId, search);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar alimento por ID" })
  @ApiParam({ name: "id", description: "ID do alimento" })
  @ApiResponse({
    status: 200,
    description: "Alimento encontrado",
    type: FoodResponseDto,
  })
  @ApiResponse({ status: 404, description: "Alimento não encontrado" })
  findOne(@Param("id") id: string, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.foodsService.findOne(id, userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar alimento" })
  @ApiParam({ name: "id", description: "ID do alimento" })
  @ApiResponse({
    status: 200,
    description: "Alimento atualizado",
    type: FoodResponseDto,
  })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateFoodDto,
    @Headers("x-user-id") userId: string,
  ) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.foodsService.update(id, userId, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Excluir alimento" })
  @ApiParam({ name: "id", description: "ID do alimento" })
  @ApiResponse({ status: 200, description: "Alimento excluído" })
  remove(@Param("id") id: string, @Headers("x-user-id") userId: string) {
    if (!userId) throw new BadRequestException("x-user-id header is required");
    return this.foodsService.remove(id, userId);
  }
}
