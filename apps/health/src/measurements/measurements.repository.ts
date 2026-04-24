import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MeasurementsRepository {
  constructor(private prisma: PrismaService) {}

  create(data: { userId: string; weightKg: number; measuredAt: Date }) {
    return this.prisma.userMeasurement.create({ data });
  }

  findByDateRange(userId: string, startDate?: Date, endDate?: Date) {
    return this.prisma.userMeasurement.findMany({
      where: {
        userId,
        ...(startDate || endDate
          ? {
              measuredAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { measuredAt: "asc" },
    });
  }

  findById(id: string) {
    return this.prisma.userMeasurement.findFirst({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.userMeasurement.delete({ where: { id } });
  }
}
