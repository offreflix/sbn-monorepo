import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoalsRepository } from './goals.repository';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly goalsRepository: GoalsRepository) {}

  async create(userId: string, dto: CreateGoalDto) {
    const activeFrom = dto.activeFrom ? new Date(dto.activeFrom) : new Date();
    activeFrom.setHours(0, 0, 0, 0);

    try {
      return await this.goalsRepository.create({
        userId,
        dailyCalorieGoal: dto.dailyCalorieGoal,
        proteinGoalG: dto.proteinGoalG,
        carbsGoalG: dto.carbsGoalG,
        fatGoalG: dto.fatGoalG,
        waterGoalMl: dto.waterGoalMl,
        activeFrom,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'A goal already exists for this date. Use PATCH to update it.',
        );
      }
      throw error;
    }
  }

  findAll(userId: string) {
    return this.goalsRepository.findAllByUser(userId);
  }

  async findCurrent(userId: string) {
    const goal = await this.goalsRepository.findCurrent(userId);
    if (!goal) {
      throw new NotFoundException('No active goal found for today');
    }
    return goal;
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    const goal = await this.goalsRepository.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    const data: any = { ...dto };
    if (dto.activeFrom) {
      data.activeFrom = new Date(dto.activeFrom);
      data.activeFrom.setHours(0, 0, 0, 0);
    }

    return this.goalsRepository.update(id, data);
  }

  async remove(id: string, userId: string) {
    const goal = await this.goalsRepository.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }
    return this.goalsRepository.remove(id);
  }
}
