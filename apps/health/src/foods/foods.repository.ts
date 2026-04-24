import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FoodsRepository {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.food.findFirst({ where: { id } });
  }

  findAllVisible(userId: string, search?: string) {
    return this.prisma.food.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: { name: "asc" },
    });
  }

  create(data: {
    name: string;
    brand?: string;
    servingSizeValue: number;
    servingSizeUnit: string;
    caloriesPerServing: number;
    proteinPerServing?: number;
    carbsPerServing?: number;
    fatPerServing?: number;
    isCustom: boolean;
    userId: string;
  }) {
    return this.prisma.food.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      name: string;
      brand: string;
      servingSizeValue: number;
      servingSizeUnit: string;
      caloriesPerServing: number;
      proteinPerServing: number;
      carbsPerServing: number;
      fatPerServing: number;
    }>,
  ) {
    return this.prisma.food.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.food.delete({ where: { id } });
  }
}
