import { Injectable, NotFoundException } from '@nestjs/common';
import { WaterLogsRepository } from './water-logs.repository';
import { CreateWaterLogDto } from './dto/create-water-log.dto';

@Injectable()
export class WaterLogsService {
  constructor(private readonly waterLogsRepository: WaterLogsRepository) {}

  create(userId: string, dto: CreateWaterLogDto) {
    const loggedDate = dto.loggedDate ? new Date(dto.loggedDate) : new Date();
    loggedDate.setHours(0, 0, 0, 0);
    return this.waterLogsRepository.create({ userId, volumeMl: dto.volumeMl, loggedDate });
  }

  async findByDate(userId: string, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const entries = await this.waterLogsRepository.findByDateAndUser(userId, date);
    const totalMl = entries.reduce((sum, e) => sum + e.volumeMl, 0);
    return { entries, totalMl };
  }

  async findTotalForDate(userId: string, date: Date) {
    const entries = await this.waterLogsRepository.findByDateAndUser(userId, date);
    return entries.reduce((sum, e) => sum + e.volumeMl, 0);
  }

  async remove(id: string, userId: string) {
    const log = await this.waterLogsRepository.findById(id);
    if (!log || log.userId !== userId) {
      throw new NotFoundException('Water log not found');
    }
    return this.waterLogsRepository.remove(id);
  }
}
