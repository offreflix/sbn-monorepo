import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Patch,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(
    @Body() dto: CreateGoalDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.goalsService.create(userId, dto);
  }

  @Get('current')
  findCurrent(@Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.goalsService.findCurrent(userId);
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.goalsService.findAll(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.goalsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.goalsService.remove(id, userId);
  }
}
