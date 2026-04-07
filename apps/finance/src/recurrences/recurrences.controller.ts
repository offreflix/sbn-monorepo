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
} from '@nestjs/common';
import { RecurrencesService } from './recurrences.service';
import { CreateRecurrenceDto } from './dto/create-recurrence.dto';
import { UpdateRecurrenceDto } from './dto/update-recurrence.dto';

const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? 'internal-secret';

@Controller('recurrences')
export class RecurrencesController {
  constructor(private readonly recurrencesService: RecurrencesService) {}

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.findAll(userId);
  }

  @Post()
  create(
    @Body() body: CreateRecurrenceDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.create({ ...body, userId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateRecurrenceDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.update(id, userId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.recurrencesService.remove(id, userId);
  }

  /**
   * Internal endpoint — called only by the Jobs worker via internal network.
   * Generates the next transaction for a recurrence.
   */
  @Post(':id/trigger')
  trigger(
    @Param('id') id: string,
    @Headers('x-internal-key') internalKey: string,
  ) {
    if (internalKey !== INTERNAL_KEY) {
      throw new ForbiddenException('Internal access only');
    }
    return this.recurrencesService.triggerTransaction(id);
  }
}
