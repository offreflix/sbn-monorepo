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
    status?: string;
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

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description,
        tags: [] as string[],
        status: data.status || 'PENDENTE',
        type: data.type,
        isPaid: data.isPaid || false,
      },
    });

    if (transaction.isPaid) {
      const increment =
        transaction.type === 'Receita'
          ? transaction.amount
          : -Number(transaction.amount);
      await this.prisma.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: increment,
          },
        },
      });
    }

    return transaction;
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

  async findOne(id: string, userId: string) {
    // Only return if belongs to user
    return this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        wallet: true,
        category: true,
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    // Ensure the transaction belongs to the user
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found or denied access');
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    // Prisma will ignore undefined fields in updateData automatically?
    // Better to be explicit or trust spread.

    // Remove immutable fields or sensitive ones if necessary
    delete updateData.userId;
    delete updateData.id;

    // Revert previous balance effect
    if (transaction.isPaid) {
      const revertIncrement =
        transaction.type === 'Receita'
          ? -Number(transaction.amount)
          : Number(transaction.amount);
      await this.prisma.wallet.update({
        where: { id: transaction.walletId },
        data: { balance: { increment: revertIncrement } },
      });
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    // Apply new balance effect
    if (updatedTransaction.isPaid) {
      const applyIncrement =
        updatedTransaction.type === 'Receita'
          ? Number(updatedTransaction.amount)
          : -Number(updatedTransaction.amount);
      await this.prisma.wallet.update({
        where: { id: updatedTransaction.walletId },
        data: { balance: { increment: applyIncrement } },
      });
    }

    return updatedTransaction;
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found or denied access');
    }

    if (transaction.isPaid) {
      const increment =
        transaction.type === 'Receita'
          ? -Number(transaction.amount)
          : Number(transaction.amount);
      await this.prisma.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: increment,
          },
        },
      });
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async getSummary(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get Total Balance from Wallets
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
    });
    const totalBalance = wallets.reduce(
      (acc, wallet) => acc + Number(wallet.balance),
      0,
    );

    // Get Income and Expenses for the period
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'Receita')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'Despesa')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
    };
  }
}
