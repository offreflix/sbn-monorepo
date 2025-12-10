import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { RecurrencesService } from './recurrences.service';

@Controller('recurrences')
export class RecurrencesController {
  constructor(private readonly recurrencesService: RecurrencesService) {}

  @Post()
  create(@Body() body: any, @Headers('x-user-id') userId: string) {
    return this.recurrencesService.create({ ...body, userId });
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.recurrencesService.findAll(userId);
  }
}
