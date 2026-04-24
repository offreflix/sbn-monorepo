import { Injectable, NotFoundException } from "@nestjs/common";
import { MeasurementsRepository } from "./measurements.repository";
import { CreateMeasurementDto } from "./dto/create-measurement.dto";

@Injectable()
export class MeasurementsService {
  constructor(
    private readonly measurementsRepository: MeasurementsRepository,
  ) {}

  create(userId: string, dto: CreateMeasurementDto) {
    const measuredAt = dto.measuredAt ? new Date(dto.measuredAt) : new Date();
    measuredAt.setHours(0, 0, 0, 0);
    return this.measurementsRepository.create({
      userId,
      weightKg: dto.weightKg,
      measuredAt,
    });
  }

  findByDateRange(userId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.measurementsRepository.findByDateRange(userId, start, end);
  }

  async remove(id: string, userId: string) {
    const measurement = await this.measurementsRepository.findById(id);
    if (!measurement || measurement.userId !== userId) {
      throw new NotFoundException("Measurement not found");
    }
    return this.measurementsRepository.remove(id);
  }
}
