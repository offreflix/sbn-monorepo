import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GoalsRepository {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.goal.findFirst({ where: { id } });
  }

  findAllByUser(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { activeFrom: "desc" },
    });
  }

  findCurrent(userId: string, asOf: Date = new Date()) {
    const d = new Date(asOf);
    d.setUTCHours(0, 0, 0, 0);
    return this.prisma.goal.findFirst({
      where: { userId, activeFrom: { lte: d } },
      orderBy: { activeFrom: "desc" },
    });
  }

  create(data: {
    userId: string;
    dailyCalorieGoal: number;
    proteinGoalG: number;
    carbsGoalG: number;
    fatGoalG: number;
    waterGoalMl?: number;
    activeFrom?: Date;
  }) {
    return this.prisma.goal.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      dailyCalorieGoal: number;
      proteinGoalG: number;
      carbsGoalG: number;
      fatGoalG: number;
      waterGoalMl: number;
      activeFrom: Date;
    }>,
  ) {
    return this.prisma.goal.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.goal.delete({ where: { id } });
  }
}
