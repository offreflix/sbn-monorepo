import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    walletId: string;
    categoryId: string;
    amount: number;
    date: string;
    description?: string;
    status: string;
    type: string;
    installments?: number;
    isPaid?: boolean;
    recurrenceId?: string;
  }) {
    const installments =
      data.installments && data.installments > 1 ? data.installments : 1;
    const purchaseGroupId = installments > 1 ? crypto.randomUUID() : null;
    const installmentAmount =
      installments > 1 ? data.amount / installments : data.amount;

    if (installments > 1) {
      const transactions = [];
      const baseDate = new Date(data.date);

      for (let i = 0; i < installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        transactions.push(
          this.prisma.transaction.create({
            data: {
              userId: data.userId,
              walletId: data.walletId,
              categoryId: data.categoryId,
              amount: installmentAmount,
              date: date,
              description: data.description
                ? `${data.description} (${i + 1}/${installments})`
                : `Parcela ${i + 1}/${installments}`,
              tags: [] as string[], // Required by Prisma schema (String[])
              status: 'PENDENTE', // Future installments are pending usually? Or inherit? Inherit for now but user said "future launches".
              // User Plan: "gera 10 lançamentos futuros".
              // "Lançamentos futuros ... nas faturas".
              type: data.type,
              isPaid: false,
              installmentNumber: i + 1,
              totalInstallments: data.installments,
              purchaseGroupId: purchaseGroupId, // Changed from groupId to purchaseGroupId to match declaration
              recurrenceId: data.recurrenceId, // Removed the trailing conditional logic as it was syntactically incorrect
            },
          }),
        );
      }
      // Execute all
      return this.prisma.$transaction(transactions);
    }

    return this.prisma.transaction.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description,
        tags: [] as string[], // Required by Prisma schema
        status: data.status,
        type: data.type,
        isPaid: data.isPaid || false,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId: userId },
      include: {
        wallet: true,
        category: true,
      },
    });
  }
}
