import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Prisma } from '@prisma/client-finance';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateTransactionDto) {
    const installments =
      data.installments && data.installments > 1 ? data.installments : 1;
    const purchaseGroupId = installments > 1 ? crypto.randomUUID() : null;
    const installmentAmount =
      installments > 1 ? data.amount / installments : data.amount;

    const wallet = await this.prisma.wallet.findFirst({
      where: { id: data.walletId, userId: userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Handle Recurrence Creation
    let newRecurrenceId = data.recurrenceId;
    if (data.recurrenceId) {
      // recurrenceId passed, just use it
    }
    // Note: The logic for creating a new recurrence from transaction data seems implicit in the original code
    // but the DTO doesn't have 'isRecurring' or 'frequency' fields.
    // Assuming for now we stick to the DTO properties.
    // If 'isRecurring' was passed in 'any', it needs to be in DTO or handled separately.
    // Looking at DTO: no 'isRecurring'. I will strictly follow DTO.
    // If logic is missing in DTO, it's a bug in DTO or service design, but I must adhere to strict typing.
    // However, I must not break existing logic if possible.
    // The original code accessed 'isRecurring' from 'data'.
    // If 'CreateTransactionDto' does NOT have 'isRecurring', then the previous code was reading undefined or property exists at runtime.
    // I previously read 'CreateTransactionDto' and it did NOT have 'isRecurring'.
    // I will add 'isRecurring' and 'frequency' to the DTO in a separate step if strictly needed,
    // but for now I will assume they might be missing or I should fix DTO.
    // Actually, to avoid breaking logic, I should likely update the DTO or these fields are not currently used/tested?
    // Let's assume for this refactor I only include fields present in DTO.
    // ... wait, if I remove logic that relied on 'any', I break features.
    // I will verify DTO again. It did NOT have isRecurring. Use of 'any' hid this.
    // I'll stick to DTO and if fields are missing, I'll update DTO in next step.
    // For this step, I will comment out recurrence creation logic that relies on non-existent DTO fields
    // or better, I will assume the DTO *should* have them and cast `data as any` locally ONLY for those fields to safely migrate
    // while noting the DTO deficiency, OR better: I will update DTO first? No, sequential tools.
    // I'll just rely on `data` as typed by DTO. If DTO is missing fields, typescript will complain.
    // To make it compile, I will temporarily cast to `any` for the missing fields inside the method to match behavior,
    // but the method signature will be strict.
    // Actually, looking at the previous file content, `isRecurring` WAS used.
    // I will cast `data` to `any` specifically for those missing fields to preserve logic until DTO is updated.

    const safeData = data as any; // Temporary to preserve behavior for fields missing in DTO

    if (safeData.isRecurring) {
      const recurrence = await this.prisma.recurrence.create({
        data: {
          userId: userId,
          walletId: data.walletId,
          categoryId: data.categoryId,
          amount: data.amount, // Recurrence is usually the full value per period, not split
          type: data.type,
          description: data.description,
          frequency: safeData.frequency || 'MONTHLY', // Default to Monthly
          startDate: new Date(data.date),
          active: true,
        },
      });
      newRecurrenceId = recurrence.id;
    }

    if (installments > 1) {
      const transactions = [];
      const baseDate = new Date(data.date);

      for (let i = 0; i < installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        const isInstallmentPaid = i === 0 && data.isPaid;
        const status = isInstallmentPaid ? 'Pago' : 'Pendente';

        transactions.push(
          this.prisma.transaction.create({
            data: {
              userId: userId,
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
              recurrenceId: newRecurrenceId,
            },
          }),
        );
      }

      const createdTransactions = await this.prisma.$transaction(transactions);

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

    if (status === 'Pago') isPaid = true;
    if (isPaid && status !== 'Pago') status = 'Pago';

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: userId,
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description,
        tags: [] as string[],
        status: status,
        type: data.type,
        isPaid: isPaid,
        installmentNumber: data.installmentNumber,
        totalInstallments: data.totalInstallments,
        recurrenceId: newRecurrenceId,
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

  async findAll(userId: string, month?: number, year?: number) {
    const where: Prisma.TransactionWhereInput = { userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        wallet: true,
        category: true,
      },
      orderBy: {
        date: 'desc',
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

  async update(id: string, userId: string, data: UpdateTransactionDto) {
    // Ensure the transaction belongs to the user
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found or denied access');
    }

    const updateData: Prisma.TransactionUpdateInput = { ...data };
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
    // userId and id are not in UpdateTransactionDto usually, but good to be safe if they leak in
    // @ts-ignore
    delete updateData.userId;
    // @ts-ignore
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
