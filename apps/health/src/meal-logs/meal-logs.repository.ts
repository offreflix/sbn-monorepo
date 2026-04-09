import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MealType } from '@prisma/client-health';

@Injectable()
export class MealLogsRepository {
  constructor(private prisma: PrismaService) {}

  create(data: {
    userId: string;
    foodId?: string;
    mealType: MealType;
    loggedAtDate: Date;
    amountConsumed: number;
    unitConsumed: string;
    calcCalories: number;
    calcProtein?: number;
    calcCarbs?: number;
    calcFat?: number;
  }) {
    return this.prisma.mealLog.create({ data, include: { food: true } });
  }

  findByDateAndUser(userId: string, date: Date) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    return this.prisma.mealLog.findMany({
      where: {
        userId,
        loggedAtDate: { gte: start, lte: end },
      },
      include: { food: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.mealLog.findFirst({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.mealLog.delete({ where: { id } });
  }
}
