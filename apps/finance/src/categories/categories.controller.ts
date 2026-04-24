import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Patch,
  Delete,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('Categories')
@ApiHeader({
  name: 'x-user-id',
  required: true,
  description: 'ID do usuário (definido pelo orchestrator)',
})
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias',
    type: [CategoryResponseDto],
  })
  findAll(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.categoriesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar categoria' })
  @ApiResponse({
    status: 201,
    description: 'Categoria criada',
    type: CategoryResponseDto,
  })
  create(
    @Body() body: CreateCategoryDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.categoriesService.create({ ...body, userId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @ApiResponse({
    status: 200,
    description: 'Categoria encontrada',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.categoriesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @ApiResponse({
    status: 200,
    description: 'Categoria atualizada',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.categoriesService.update(id, userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir categoria' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria excluída' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.categoriesService.remove(id, userId);
  }
}
