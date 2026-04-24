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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import type { NubankFile } from './nubank/nubank-file-parser.interface';
import {
  TransactionResponseDto,
  TransactionSummaryResponseDto,
} from './dto/transaction-response.dto';

@ApiTags('Transactions')
@ApiHeader({
  name: 'x-user-id',
  required: true,
  description: 'ID do usuário (definido pelo orchestrator)',
})
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo de transações do mês' })
  @ApiQuery({ name: 'month', required: false, example: 1 })
  @ApiQuery({ name: 'year', required: false, example: 2024 })
  @ApiResponse({
    status: 200,
    description: 'Totais de receitas e despesas',
    type: TransactionSummaryResponseDto,
  })
  getSummary(
    @Headers('x-user-id') userId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
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
  @ApiOperation({ summary: 'Criar transação' })
  @ApiResponse({
    status: 201,
    description: 'Transação criada',
    type: TransactionResponseDto,
  })
  create(
    @Body() body: CreateTransactionDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.transactionsService.create(userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transações do usuário' })
  @ApiQuery({ name: 'month', required: false, example: 1 })
  @ApiQuery({ name: 'year', required: false, example: 2024 })
  @ApiResponse({
    status: 200,
    description: 'Lista de transações',
    type: [TransactionResponseDto],
  })
  findAll(
    @Headers('x-user-id') userId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.transactionsService.findAll(
      userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar transação por ID' })
  @ApiParam({ name: 'id', description: 'ID da transação' })
  @ApiResponse({
    status: 200,
    description: 'Transação encontrada',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.transactionsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar transação' })
  @ApiParam({ name: 'id', description: 'ID da transação' })
  @ApiResponse({
    status: 200,
    description: 'Transação atualizada',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.transactionsService.update(id, userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir transação' })
  @ApiParam({ name: 'id', description: 'ID da transação' })
  @ApiResponse({ status: 200, description: 'Transação excluída' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.transactionsService.remove(id, userId);
  }

  @Post('import/nubank')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importar transações via CSV do Nubank' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo CSV exportado do Nubank',
        },
        walletId: { type: 'string', description: 'ID da carteira destino' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transações importadas com sucesso',
    type: [TransactionResponseDto],
  })
  importNubank(
    @UploadedFile() file: NubankFile,
    @Body('walletId') walletId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    if (!file) {
      throw new BadRequestException('file is required');
    }
    if (!walletId) {
      throw new BadRequestException('walletId is required');
    }
    return this.transactionsService.importNubank({
      userId,
      walletId,
      file,
    });
  }
}
