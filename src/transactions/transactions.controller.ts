import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() body: any, @Headers('x-user-id') userId: string) {
    return this.transactionsService.create({ ...body, userId });
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.transactionsService.findAll(userId);
  }
}
