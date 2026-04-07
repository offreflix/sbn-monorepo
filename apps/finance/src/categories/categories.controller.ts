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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.categoriesService.findAll(userId);
  }

  @Post()
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
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.categoriesService.findOne(id, userId);
  }

  @Patch(':id')
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
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.categoriesService.remove(id, userId);
  }
}
