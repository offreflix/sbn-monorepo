import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() body: any, @Headers('x-user-id') userId: string) {
    return this.categoriesService.create({ ...body, userId });
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.categoriesService.findAll(userId);
  }
}
