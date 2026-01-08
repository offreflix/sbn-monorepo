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
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('summary')
  getSummary(
    @Headers('x-user-id') userId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();
    return this.transactionsService.getSummary(
      userId,
      Number(currentMonth),
      Number(currentYear),
    );
  }

  @Post()
  create(
    @Body() body: CreateTransactionDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      // Should be handled by guard or pipe, but validation pipe might not validate headers directly easily without custom decorators.
      // User requirement says "Validar headers obrigatórios".
      // For now, explicit check or rely on logic.
      throw new BadRequestException('x-user-id header is required');
    }
    return this.transactionsService.create({ ...body, userId });
  }

  @Get()
  findAll(
    @Headers('x-user-id') userId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.transactionsService.findAll(
      userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.transactionsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.transactionsService.update(id, userId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.transactionsService.remove(id, userId);
  }
}
