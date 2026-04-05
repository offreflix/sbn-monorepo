import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Finds categories for a user including global defaults, used during Nubank import.
   */
  findForNubank(userId: string, type: string) {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
        type,
        OR: [{ userId }, { userId: null, isDefault: true }],
      },
    });
  }

  createDefault(userId: string, name: string, type: string) {
    return this.prisma.category.create({
      data: { userId, name, type, isDefault: false },
    });
  }
}
