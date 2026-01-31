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
      where: { userId: userId, deletedAt: null },
      include: {
        wallet: true,
        category: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const recurrence = await this.prisma.recurrence.findFirst({
      where: { id, userId },
      include: {
        wallet: true,
        category: true,
      },
    });
    if (!recurrence) {
      throw new Error('Recurrence not found');
    }
    return recurrence;
  }

  async update(id: string, userId: string, data: any) {
    await this.findOne(id, userId);

    const updateData: any = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    delete updateData.userId;
    delete updateData.id;

    return this.prisma.recurrence.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.recurrence.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
