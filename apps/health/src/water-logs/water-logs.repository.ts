import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaterLogsRepository {
  constructor(private prisma: PrismaService) {}

  create(data: { userId: string; volumeMl: number; loggedDate: Date }) {
    return this.prisma.waterLog.create({ data });
  }

  findByDateAndUser(userId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.prisma.waterLog.findMany({
      where: {
        userId,
        loggedDate: { gte: start, lte: end },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.waterLog.findFirst({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.waterLog.delete({ where: { id } });
  }
}
