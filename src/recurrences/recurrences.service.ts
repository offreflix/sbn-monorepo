import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecurrencesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    walletId: string;
    categoryId: string;
    amount: number;
    type: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }) {
    return this.prisma.recurrence.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        frequency: data.frequency,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.recurrence.findMany({
      where: { userId: userId },
      include: {
        wallet: true,
        category: true,
      },
    });
  }
}
