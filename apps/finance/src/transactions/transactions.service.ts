import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Prisma, Transaction } from '@prisma/client-finance';
import { TransactionsRepository } from './transactions.repository';
import { WalletsRepository } from '../wallets/wallets.repository';
import { BalanceService } from './balance.service';
import {
  InstallmentService,
  InstallmentTransaction,
} from './installment.service';
import { NubankImportService } from './nubank-import.service';
import { NubankFile } from './nubank/nubank-file-parser.interface';
import { RecurrenceQueueService } from '../recurrences/recurrence-queue.service';

@Injectable()
export class TransactionsService {
  constructor(
    private txRepo: TransactionsRepository,
    private walletsRepo: WalletsRepository,
    private balanceService: BalanceService,
    private installmentService: InstallmentService,
    private nubankImportService: NubankImportService,
    private recurrenceQueueService: RecurrenceQueueService,
  ) {}

  async create(userId: string, data: CreateTransactionDto) {
    const installments =
      data.installments && data.installments > 1 ? data.installments : 1;
    const purchaseGroupId = installments > 1 ? crypto.randomUUID() : null;
    const installmentAmount =
      installments > 1 ? data.amount / installments : data.amount;

    const wallet = await this.walletsRepo.findByIdAndUser(
      data.walletId,
      userId,
    );

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const walletIsCredit = this.balanceService.isCreditCard(wallet.type);

    let newRecurrenceId = data.recurrenceId;
    if (data.isRecurring) {
      const recurrence = await this.txRepo.createRecurrence({
        userId,
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        frequency: data.frequency || 'MONTHLY',
        startDate: new Date(data.date),
        active: true,
      });
      newRecurrenceId = recurrence.id;
      await this.recurrenceQueueService.scheduleNext(
        recurrence.id,
        recurrence.frequency,
        recurrence.startDate,
        recurrence.timezone,
      );
    }

    if (installments > 1) {
      const creates: Prisma.PrismaPromise<Transaction>[] = [];
      const baseDate = new Date(data.date);

      for (let i = 0; i < installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        const isInstallmentPaid = i === 0 && data.isPaid;
        const status = isInstallmentPaid ? 'Pago' : 'Pendente';

        creates.push(
          this.txRepo.create({
            userId,
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
          }),
        );
      }

      const createdTransactions = await this.txRepo.createMany(creates);

      for (const tx of createdTransactions) {
        await this.balanceService.applyBalance(
          {
            walletId: tx.walletId,
            isPaid: tx.isPaid,
            type: tx.type,
            amount: tx.amount,
          },
          walletIsCredit,
        );
      }
      return createdTransactions;
    }

    let isPaid = data.isPaid || false;
    let status = data.status || (isPaid ? 'Pago' : 'Pendente');

    if (status === 'Pago') isPaid = true;
    if (isPaid && status !== 'Pago') status = 'Pago';

    const transaction = await this.txRepo.create({
      userId,
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
    });

    await this.balanceService.applyBalance(
      {
        walletId: transaction.walletId,
        isPaid: transaction.isPaid,
        type: transaction.type,
        amount: transaction.amount,
      },
      walletIsCredit,
    );

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

    return this.txRepo.findMany(where, {
      include: { wallet: true, category: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.txRepo.findFirst(
      { id, userId },
      { wallet: true, category: true },
    );
  }

  async update(id: string, userId: string, data: UpdateTransactionDto) {
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found or denied access');
    }

    // Sync isPaid / status
    let isPaid: boolean = data.isPaid ?? transaction.isPaid;
    let status: string = data.status ?? transaction.status;

    if (data.isPaid !== undefined) {
      isPaid = data.isPaid;
      if (isPaid) {
        status = 'Pago';
      } else if (!data.status || data.status === 'Pago') {
        status = 'Pendente';
      }
    } else if (data.status === 'Pago') {
      isPaid = true;
    } else if (data.status === 'Pendente') {
      isPaid = false;
    }

    // Delegate to InstallmentService if this involves installments
    if (
      transaction.purchaseGroupId ||
      (data.installments && data.installments > 1)
    ) {
      return this.installmentService.resolveUpdate({
        id,
        userId,
        data,
        transaction: transaction as InstallmentTransaction,
        isPaid,
        status,
      });
    }

    // --- Single transaction update ---
    const updateData: Prisma.TransactionUpdateInput = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.walletId) updateData.wallet = { connect: { id: data.walletId } };
    if (data.categoryId)
      updateData.category = { connect: { id: data.categoryId } };
    if (data.installmentNumber !== undefined)
      updateData.installmentNumber = data.installmentNumber;
    if (data.totalInstallments !== undefined)
      updateData.totalInstallments = data.totalInstallments;
    updateData.isPaid = isPaid;
    updateData.status = status;

    const prevWalletIsCredit = this.balanceService.isCreditCard(
      transaction.wallet?.type ?? '',
    );

    let nextWalletIsCredit = prevWalletIsCredit;
    if (data.walletId && data.walletId !== transaction.walletId) {
      nextWalletIsCredit = await this.balanceService.getWalletIsCredit(
        data.walletId,
        userId,
        false,
      );
    }

    await this.balanceService.revertBalance(
      {
        walletId: transaction.walletId,
        isPaid: transaction.isPaid,
        type: transaction.type as string,
        amount: transaction.amount,
      },
      prevWalletIsCredit,
    );

    const updated = await this.txRepo.update(id, updateData);

    await this.balanceService.applyBalance(
      {
        walletId: updated.walletId,
        isPaid: updated.isPaid,
        type: updated.type as string,
        amount: updated.amount,
      },
      nextWalletIsCredit,
    );

    return updated;
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found or denied access');
    }

    const walletIsCredit = this.balanceService.isCreditCard(
      transaction.wallet?.type ?? '',
    );

    if (transaction.purchaseGroupId) {
      const allInGroup = await this.txRepo.findByPurchaseGroup(
        transaction.purchaseGroupId,
        userId,
      );

      for (const tx of allInGroup) {
        await this.balanceService.revertBalance(
          {
            walletId: tx.walletId,
            isPaid: tx.isPaid,
            type: tx.type,
            amount: tx.amount,
          },
          walletIsCredit,
        );
      }

      await this.txRepo.deleteMany({
        purchaseGroupId: transaction.purchaseGroupId,
        userId,
      });

      return { deleted: allInGroup.length };
    }

    await this.balanceService.revertBalance(
      {
        walletId: transaction.walletId,
        isPaid: transaction.isPaid,
        type: transaction.type as string,
        amount: transaction.amount,
      },
      walletIsCredit,
    );

    return this.txRepo.delete(id);
  }

  async getSummary(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const wallets = await this.walletsRepo.findAllByUser(userId);
    const totalBalance = wallets.reduce(
      (acc, wallet) => acc + Number(wallet.balance),
      0,
    );

    const transactions = await this.txRepo.findMany({
      userId,
      date: { gte: startDate, lte: endDate },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'Receita')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'Despesa')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return { totalBalance, totalIncome, totalExpenses };
  }

  async importNubank(params: {
    userId: string;
    walletId: string;
    file: NubankFile;
  }) {
    return this.nubankImportService.import(params);
  }
}
