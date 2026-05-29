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
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { RecurrencesService } from './recurrences.service';
import { CreateRecurrenceDto } from './dto/create-recurrence.dto';
import { UpdateRecurrenceDto } from './dto/update-recurrence.dto';
import { RecurrenceResponseDto } from './dto/recurrence-response.dto';
import { TransactionResponseDto } from '../transactions/dto/transaction-response.dto';

function getInternalKey() {
  const key = process.env.INTERNAL_SERVICE_KEY;
  if (!key && process.env.NODE_ENV === 'production') {
    throw new InternalServerErrorException(
      'INTERNAL_SERVICE_KEY is required in production',
    );
  }
  return key ?? 'internal-secret';
}

@ApiTags('Recurrences')
@ApiHeader({
  name: 'x-user-id',
  required: true,
  description: 'ID do usuário (definido pelo orchestrator)',
})
@Controller('recurrences')
export class RecurrencesController {
  constructor(private readonly recurrencesService: RecurrencesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar recorrências do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de recorrências',
    type: [RecurrenceResponseDto],
  })
  findAll(@Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar recorrência' })
  @ApiResponse({
    status: 201,
    description: 'Recorrência criada',
    type: RecurrenceResponseDto,
  })
  create(
    @Body() body: CreateRecurrenceDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.create({ ...body, userId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar recorrência por ID' })
  @ApiParam({ name: 'id', description: 'ID da recorrência' })
  @ApiResponse({
    status: 200,
    description: 'Recorrência encontrada',
    type: RecurrenceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Recorrência não encontrada' })
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar recorrência' })
  @ApiParam({ name: 'id', description: 'ID da recorrência' })
  @ApiResponse({
    status: 200,
    description: 'Recorrência atualizada',
    type: RecurrenceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Recorrência não encontrada' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateRecurrenceDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.update(id, userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir recorrência' })
  @ApiParam({ name: 'id', description: 'ID da recorrência' })
  @ApiResponse({ status: 200, description: 'Recorrência excluída' })
  @ApiResponse({ status: 404, description: 'Recorrência não encontrada' })
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.remove(id, userId);
  }

  @Post(':id/trigger')
  @ApiOperation({
    summary: '[INTERNAL] Disparar geração de transação para a recorrência',
  })
  @ApiHeader({
    name: 'x-internal-key',
    required: true,
    description: 'Chave interna — uso exclusivo do Jobs worker',
  })
  @ApiParam({ name: 'id', description: 'ID da recorrência' })
  @ApiResponse({
    status: 201,
    description: 'Transação gerada',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  trigger(
    @Param('id') id: string,
    @Headers('x-internal-key') internalKey: string,
  ) {
    if (internalKey !== getInternalKey()) {
      throw new ForbiddenException('Internal access only');
    }
    return this.recurrencesService.triggerTransaction(id);
  }
}
