import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private prisma: PrismaService) {}

  findWalletsByUser(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId, deletedAt: null },
    });
  }

  findCcTransactionsByMonth(
    userId: string,
    walletIds: string[],
    month: number,
    year: number,
  ) {
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.transaction.findMany({
      where: {
        userId,
        walletId: { in: walletIds },
        type: 'Despesa',
        status: { not: 'Pago' },
        date: { gte: startDate, lte: endDate },
      },
    });
  }

  findMonthTransactions(
    userId: string,
    month: number,
    year: number,
    options?: { include?: { category?: boolean } },
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: options?.include,
    });
  }

  findYearTransactions(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      select: { date: true, amount: true, type: true },
    });
  }
}
