import { Injectable, NotFoundException } from '@nestjs/common';
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

    const wallet = await this.prisma.wallet.findFirst({
      where: { id: data.walletId, userId: data.userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (installments > 1) {
      const transactions = [];
      const baseDate = new Date(data.date);

      for (let i = 0; i < installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        // Future installments are 'Pendente' unless specifically handled logic requires otherwise
        // For simplicity, first installment follows isPaid, others are Pendente.
        const isInstallmentPaid = i === 0 && data.isPaid;
        const status = isInstallmentPaid ? 'Pago' : 'Pendente';

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
              tags: [] as string[],
              status: status,
              type: data.type,
              isPaid: isInstallmentPaid,
              installmentNumber: i + 1,
              totalInstallments: data.installments,
              purchaseGroupId: purchaseGroupId,
              recurrenceId: data.recurrenceId,
            },
          }),
        );
      }

      const createdTransactions = await this.prisma.$transaction(transactions);

      // Update balance for the FIRST paid installment if applicable
      if (data.isPaid) {
        const firstTx = createdTransactions[0];
        const increment =
          firstTx.type === 'Receita'
            ? Number(firstTx.amount)
            : -Number(firstTx.amount);
        await this.prisma.wallet.update({
          where: { id: firstTx.walletId },
          data: { balance: { increment: increment } },
        });
      }
      return createdTransactions;
    }

    let isPaid = data.isPaid || false;
    let status = data.status || (isPaid ? 'Pago' : 'Pendente');

    // Consistency check
    if (status === 'Pago') isPaid = true;
    if (isPaid && status !== 'Pago') status = 'Pago';

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: data.userId,
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description,
        tags: [] as string[],
        status: status,
        type: data.type,
        isPaid: isPaid,
      },
    });

    if (transaction.isPaid) {
      const increment =
        transaction.type === 'Receita'
          ? Number(transaction.amount) // Ensure conversion if needed, though type is number already
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

    // Logic to sync isPaid and status
    if (data.isPaid !== undefined) {
      updateData.isPaid = data.isPaid;
      // Auto-update status based on isPaid
      if (updateData.isPaid) {
        updateData.status = 'Pago';
      } else {
        if (!data.status || data.status === 'Pago') {
          updateData.status = 'Pendente';
        }
      }
    } else if (data.status === 'Pago') {
      updateData.isPaid = true;
    } else if (data.status === 'Pendente') {
      updateData.isPaid = false;
    }

    // Remove immutable fields or sensitive ones if necessary
    delete updateData.userId;
    delete updateData.id;

    // Revert previous balance effect if it was paid
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

    // Apply new balance effect if paid
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
