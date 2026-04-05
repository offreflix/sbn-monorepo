import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateTransactionDto,
  TransactionType,
} from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Prisma, Transaction } from '@prisma/client-finance';
import * as path from 'path';
import { TransactionsRepository } from './transactions.repository';
import { WalletsRepository } from '../wallets/wallets.repository';
import { CategoriesRepository } from '../categories/categories.repository';

declare const require: any;

type NubankParsedRow = {
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
};

@Injectable()
export class TransactionsService {
  constructor(
    private txRepo: TransactionsRepository,
    private walletsRepo: WalletsRepository,
    private catRepo: CategoriesRepository,
  ) {}

  private isCreditCard(walletType: string): boolean {
    const t = walletType.toLowerCase();
    return (
      t.includes('crédito') || t.includes('credito') || t.includes('credit')
    );
  }

  /**
   * Determines whether a transaction should affect the wallet balance.
   *
   * Credit card Despesas: only PENDING transactions consume the limit.
   *   - Pending  → affects balance (limit consumed)
   *   - Paid     → does NOT affect balance (limit is released by reverting the pending effect)
   *
   * All other cases (regular wallet or CC Receita): only PAID transactions affect balance.
   */
  private shouldAffectBalance(
    walletIsCredit: boolean,
    isPaid: boolean,
    type: string,
  ): boolean {
    if (walletIsCredit && type === 'Despesa') {
      return !isPaid; // pending CC purchase consumes the limit
    }
    return isPaid; // regular wallet or CC receita: only paid state affects balance
  }

  async create(userId: string, data: CreateTransactionDto) {
    const installments =
      data.installments && data.installments > 1 ? data.installments : 1;
    const purchaseGroupId = installments > 1 ? crypto.randomUUID() : null;
    const installmentAmount =
      installments > 1 ? data.amount / installments : data.amount;

    const wallet = await this.walletsRepo.findByIdAndUser(data.walletId, userId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const walletIsCredit = this.isCreditCard(wallet.type);

    const safeData = data as any; // Temporary to preserve behavior for fields missing in DTO

    let newRecurrenceId = data.recurrenceId;
    if (safeData.isRecurring) {
      const recurrence = await this.txRepo.createRecurrence({
        userId,
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        frequency: safeData.frequency || 'MONTHLY',
        startDate: new Date(data.date),
        active: true,
      });
      newRecurrenceId = recurrence.id;
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
        if (this.shouldAffectBalance(walletIsCredit, tx.isPaid, tx.type)) {
          const increment =
            tx.type === 'Receita' ? Number(tx.amount) : -Number(tx.amount);
          await this.walletsRepo.updateBalance(tx.walletId, increment);
        }
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

    if (
      this.shouldAffectBalance(
        walletIsCredit,
        transaction.isPaid,
        transaction.type,
      )
    ) {
      const increment =
        transaction.type === 'Receita'
          ? Number(transaction.amount)
          : -Number(transaction.amount);
      await this.walletsRepo.updateBalance(transaction.walletId, increment);
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

    // --- Installment group update ---
    if (transaction.purchaseGroupId) {
      return this.updateInstallmentGroup({
        id,
        userId,
        data,
        transaction,
        isPaid,
        status,
      });
    }

    // --- Convert single transaction to installment group ---
    if (data.installments && data.installments > 1) {
      return this.convertToInstallmentGroup({
        id,
        userId,
        data,
        transaction,
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

    const prevWalletIsCredit = this.isCreditCard(
      transaction.wallet?.type ?? '',
    );

    let nextWalletIsCredit = prevWalletIsCredit;
    if (data.walletId && data.walletId !== transaction.walletId) {
      const nextWallet = await this.walletsRepo.findByIdAndUser(
        data.walletId,
        userId,
      );
      nextWalletIsCredit = nextWallet
        ? this.isCreditCard(nextWallet.type)
        : false;
    }

    // Revert the previous balance contribution of this transaction.
    if (
      this.shouldAffectBalance(
        prevWalletIsCredit,
        transaction.isPaid,
        transaction.type as string,
      )
    ) {
      const revert =
        transaction.type === 'Receita'
          ? -Number(transaction.amount)
          : Number(transaction.amount);
      await this.walletsRepo.updateBalance(transaction.walletId, revert);
    }

    const updated = await this.txRepo.update(id, updateData);

    // Apply the new balance contribution of the updated transaction.
    if (
      this.shouldAffectBalance(
        nextWalletIsCredit,
        updated.isPaid,
        updated.type as string,
      )
    ) {
      const apply =
        updated.type === 'Receita'
          ? Number(updated.amount)
          : -Number(updated.amount);
      await this.walletsRepo.updateBalance(updated.walletId, apply);
    }

    return updated;
  }

  private async convertToInstallmentGroup({
    id,
    userId,
    data,
    transaction,
    isPaid,
    status,
  }: {
    id: string;
    userId: string;
    data: UpdateTransactionDto;
    transaction: Awaited<ReturnType<typeof this.findOne>>;
    isPaid: boolean;
    status: string;
  }) {
    const installments = data.installments!;
    const totalAmount =
      data.amount !== undefined ? data.amount : Number(transaction.amount);
    const installmentAmount = totalAmount / installments;

    const walletIsCredit = this.isCreditCard(transaction.wallet?.type ?? '');

    // Revert the original transaction's balance contribution
    if (
      this.shouldAffectBalance(
        walletIsCredit,
        transaction.isPaid,
        transaction.type as string,
      )
    ) {
      const revert =
        transaction.type === 'Receita'
          ? -Number(transaction.amount)
          : Number(transaction.amount);
      await this.walletsRepo.updateBalance(transaction.walletId, revert);
    }

    const purchaseGroupId = crypto.randomUUID();
    const baseDate = new Date(data.date ?? transaction.date);
    const walletIdToUse = data.walletId ?? transaction.walletId;
    const categoryIdToUse = data.categoryId ?? transaction.categoryId;
    const typeToUse = data.type ?? (transaction.type as string);
    const stripSuffix = (desc: string) =>
      (desc ?? '').replace(/\s*\(\d+\/\d+\)$/, '').trim();
    const baseDesc =
      data.description !== undefined
        ? stripSuffix(data.description)
        : stripSuffix(transaction.description ?? '');

    // Update existing transaction as installment #1
    const firstIsPaid = isPaid;
    const firstStatus = status;
    await this.txRepo.update(id, {
      amount: installmentAmount,
      date: baseDate,
      description: `${baseDesc} (1/${installments})`,
      wallet: { connect: { id: walletIdToUse } },
      category: { connect: { id: categoryIdToUse } },
      type: typeToUse,
      isPaid: firstIsPaid,
      status: firstStatus,
      installmentNumber: 1,
      totalInstallments: installments,
      purchaseGroupId,
    });

    // Create installments #2 through N
    for (let i = 2; i <= installments; i++) {
      const date = new Date(baseDate);
      date.setMonth(baseDate.getMonth() + (i - 1));
      await this.txRepo.create({
        userId,
        walletId: walletIdToUse,
        categoryId: categoryIdToUse,
        amount: installmentAmount,
        date,
        description: `${baseDesc} (${i}/${installments})`,
        tags: [],
        status: 'Pendente',
        type: typeToUse,
        isPaid: false,
        installmentNumber: i,
        totalInstallments: installments,
        purchaseGroupId,
      });
    }

    // Apply balance for all installments in the new group
    const newGroup = await this.txRepo.findByPurchaseGroup(
      purchaseGroupId,
      userId,
    );
    for (const tx of newGroup) {
      if (this.shouldAffectBalance(walletIsCredit, tx.isPaid, tx.type)) {
        const apply =
          tx.type === 'Receita' ? Number(tx.amount) : -Number(tx.amount);
        await this.walletsRepo.updateBalance(tx.walletId, apply);
      }
    }

    return this.findOne(id, userId);
  }

  private async convertGroupToSingle({
    id,
    userId,
    data,
    transaction,
    allInGroup,
    isPaid,
    status,
  }: {
    id: string;
    userId: string;
    data: UpdateTransactionDto;
    transaction: Awaited<ReturnType<typeof this.findOne>>;
    allInGroup: {
      id: string;
      amount: any;
      isPaid: boolean;
      type: string;
      walletId: string;
    }[];
    isPaid: boolean;
    status: string;
  }) {
    const walletIsCredit = this.isCreditCard(transaction.wallet?.type ?? '');

    // Revert balance for every installment in the group
    for (const tx of allInGroup) {
      if (this.shouldAffectBalance(walletIsCredit, tx.isPaid, tx.type)) {
        const revert =
          tx.type === 'Receita' ? -Number(tx.amount) : Number(tx.amount);
        await this.walletsRepo.updateBalance(tx.walletId, revert);
      }
    }

    // Delete all sibling installments (keep only the one being edited)
    await this.txRepo.deleteMany({
      purchaseGroupId: transaction.purchaseGroupId,
      userId,
      id: { not: id },
    });

    // Total amount: if user changed it use that, otherwise sum of all installments
    const currentTotalAmount = Number(allInGroup[0].amount) * allInGroup.length;
    const totalAmount =
      data.amount !== undefined ? data.amount : currentTotalAmount;

    const stripSuffix = (desc: string) =>
      (desc ?? '').replace(/\s*\(\d+\/\d+\)$/, '').trim();
    const singleDesc =
      data.description !== undefined
        ? stripSuffix(data.description)
        : stripSuffix(transaction.description ?? '');

    // Update the remaining transaction as a plain single transaction
    const updated = await this.txRepo.update(id, {
      amount: totalAmount,
      date: data.date ? new Date(data.date) : transaction.date,
      description: singleDesc,
      ...(data.walletId && { wallet: { connect: { id: data.walletId } } }),
      ...(data.categoryId && {
        category: { connect: { id: data.categoryId } },
      }),
      ...(data.type && { type: data.type }),
      isPaid,
      status,
      installmentNumber: null,
      totalInstallments: null,
      purchaseGroupId: null,
    });

    // Apply balance for the new single transaction
    const walletIdToUse = data.walletId ?? transaction.walletId;
    const nextWallet = data.walletId
      ? await this.walletsRepo.findByIdAndUser(walletIdToUse, userId)
      : null;
    const nextWalletIsCredit = nextWallet
      ? this.isCreditCard(nextWallet.type)
      : walletIsCredit;

    if (
      this.shouldAffectBalance(nextWalletIsCredit, updated.isPaid, updated.type)
    ) {
      const apply =
        updated.type === 'Receita'
          ? Number(updated.amount)
          : -Number(updated.amount);
      await this.walletsRepo.updateBalance(updated.walletId, apply);
    }

    return updated;
  }

  private async updateInstallmentGroup({
    id,
    userId,
    data,
    transaction,
    isPaid,
    status,
  }: {
    id: string;
    userId: string;
    data: UpdateTransactionDto;
    transaction: Awaited<ReturnType<typeof this.findOne>>;
    isPaid: boolean;
    status: string;
  }) {
    const allInGroup = await this.txRepo.findByPurchaseGroup(
      transaction.purchaseGroupId!,
      userId,
      { orderBy: { installmentNumber: 'asc' } },
    );

    const currentCount = allInGroup.length;
    const newCount = data.totalInstallments ?? currentCount;

    // --- Convert installment group back to single transaction ---
    if (newCount === 1) {
      return this.convertGroupToSingle({
        id,
        userId,
        data,
        transaction,
        allInGroup,
        isPaid,
        status,
      });
    }

    // Amount is treated as the NEW TOTAL; divide by newCount to get per-installment
    const currentTotalAmount = Number(allInGroup[0].amount) * currentCount;
    const newTotalAmount =
      data.amount !== undefined ? data.amount : currentTotalAmount;
    const newInstallmentAmount = newTotalAmount / newCount;

    // Strip "(N/M)" suffix to get base description
    const stripSuffix = (desc: string) =>
      (desc ?? '').replace(/\s*\(\d+\/\d+\)$/, '').trim();
    const newBaseDesc =
      data.description !== undefined
        ? stripSuffix(data.description)
        : stripSuffix(transaction.description ?? '');

    const groupWalletIsCredit = this.isCreditCard(
      transaction.wallet?.type ?? '',
    );

    // Revert the balance contribution of each installment in the group.
    const toRevert = allInGroup.filter((t) =>
      this.shouldAffectBalance(groupWalletIsCredit, t.isPaid, t.type),
    );
    for (const t of toRevert) {
      const revert =
        t.type === 'Receita' ? -Number(t.amount) : Number(t.amount);
      await this.walletsRepo.updateBalance(t.walletId, revert);
    }

    // Handle count decrease: delete excess installments from the end
    if (newCount < currentCount) {
      await this.txRepo.deleteMany({
        purchaseGroupId: transaction.purchaseGroupId,
        userId,
        installmentNumber: { gt: newCount },
      });
    }

    // Handle count increase: create new installments
    if (newCount > currentCount) {
      const lastTx = allInGroup[allInGroup.length - 1];
      const lastDate = new Date(lastTx.date);
      const walletIdToUse = data.walletId ?? lastTx.walletId;
      const categoryIdToUse = data.categoryId ?? lastTx.categoryId;
      const typeToUse = data.type ?? lastTx.type;

      for (let i = currentCount + 1; i <= newCount; i++) {
        const newDate = new Date(lastDate);
        newDate.setMonth(lastDate.getMonth() + (i - currentCount));
        await this.txRepo.create({
          userId,
          walletId: walletIdToUse,
          categoryId: categoryIdToUse,
          amount: newInstallmentAmount,
          date: newDate,
          description: `${newBaseDesc} (${i}/${newCount})`,
          tags: [],
          status: 'Pendente',
          type: typeToUse,
          isPaid: false,
          installmentNumber: i,
          totalInstallments: newCount,
          purchaseGroupId: transaction.purchaseGroupId,
        });
      }
    }

    // Update all remaining installments
    const remaining = await this.txRepo.findByPurchaseGroup(
      transaction.purchaseGroupId!,
      userId,
      { orderBy: { installmentNumber: 'asc' } },
    );

    for (const tx of remaining) {
      const txData: Prisma.TransactionUpdateInput = {
        amount: newInstallmentAmount,
        description: `${newBaseDesc} (${tx.installmentNumber}/${newCount})`,
        totalInstallments: newCount,
      };
      if (data.walletId) txData.wallet = { connect: { id: data.walletId } };
      if (data.categoryId)
        txData.category = { connect: { id: data.categoryId } };
      if (data.type) txData.type = data.type;

      // isPaid, status and date only change for the specific transaction being edited
      if (tx.id === id) {
        txData.isPaid = isPaid;
        txData.status = status;
        if (data.date) txData.date = new Date(data.date);
      }

      await this.txRepo.update(tx.id, txData);
    }

    // Re-apply the balance contribution of each updated installment.
    const updatedGroup = await this.txRepo.findByPurchaseGroup(
      transaction.purchaseGroupId!,
      userId,
    );
    const toApply = updatedGroup.filter((t) =>
      this.shouldAffectBalance(groupWalletIsCredit, t.isPaid, t.type),
    );
    for (const t of toApply) {
      const apply = t.type === 'Receita' ? Number(t.amount) : -Number(t.amount);
      await this.walletsRepo.updateBalance(t.walletId, apply);
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found or denied access');
    }

    const walletIsCredit = this.isCreditCard(transaction.wallet?.type ?? '');

    // If the transaction belongs to an installment group, delete the entire group.
    if (transaction.purchaseGroupId) {
      const allInGroup = await this.txRepo.findByPurchaseGroup(
        transaction.purchaseGroupId,
        userId,
      );

      // Revert balance for every installment that was affecting it.
      for (const tx of allInGroup) {
        if (this.shouldAffectBalance(walletIsCredit, tx.isPaid, tx.type)) {
          const increment =
            tx.type === 'Receita' ? -Number(tx.amount) : Number(tx.amount);
          await this.walletsRepo.updateBalance(tx.walletId, increment);
        }
      }

      await this.txRepo.deleteMany({
        purchaseGroupId: transaction.purchaseGroupId,
        userId,
      });

      return { deleted: allInGroup.length };
    }

    // Revert balance on delete only if this transaction was affecting the balance.
    if (
      this.shouldAffectBalance(
        walletIsCredit,
        transaction.isPaid,
        transaction.type as string,
      )
    ) {
      const increment =
        transaction.type === 'Receita'
          ? -Number(transaction.amount)
          : Number(transaction.amount);
      await this.walletsRepo.updateBalance(transaction.walletId, increment);
    }

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

  async importNubank(params: { userId: string; walletId: string; file: any }) {
    const { userId, walletId, file } = params;

    const wallet = await this.walletsRepo.findByIdAndUser(walletId, userId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const ext = path.extname(file.originalname || '').toLowerCase();
    let rows: NubankParsedRow[] = [];

    if (ext === '.csv') {
      rows = this.parseNubankCsv(file.buffer.toString('utf8'));
    } else if (ext === '.ofx') {
      rows = this.parseNubankOfx(file.buffer.toString('utf8'));
    } else if (ext === '.pdf') {
      rows = await this.parseNubankPdf(file.buffer);
    } else {
      throw new Error('Unsupported Nubank file type');
    }

    const createdTransactions: Transaction[] = [];

    for (const row of rows) {
      const categoryId = await this.resolveCategoryIdForNubank(
        userId,
        row.type,
        row.description,
      );
      const installmentInfo = this.parseInstallmentInfo(row.description);

      if (installmentInfo) {
        const existingSeries = await this.txRepo.findFirst({
          userId,
          walletId,
          totalInstallments: installmentInfo.totalInstallments,
          amount: row.amount,
          description: {
            contains: installmentInfo.baseDescription,
            mode: 'insensitive',
          },
        });

        if (existingSeries) {
          continue;
        }

        const firstDate = new Date(row.date);
        firstDate.setHours(0, 0, 0, 0);
        firstDate.setMonth(
          firstDate.getMonth() - (installmentInfo.installmentNumber - 1),
        );

        const purchaseGroupId = crypto.randomUUID();

        for (let i = 1; i <= installmentInfo.totalInstallments; i++) {
          const installmentDate = new Date(firstDate);
          installmentDate.setMonth(firstDate.getMonth() + (i - 1));

          const description = `${installmentInfo.baseDescription} - Parcela ${i}/${installmentInfo.totalInstallments}`;

          const existingInstallment = await this.txRepo.findFirst({
            userId,
            walletId,
            installmentNumber: i,
            totalInstallments: installmentInfo.totalInstallments,
            description,
          });

          if (existingInstallment) {
            continue;
          }

          const created = await this.txRepo.create({
            userId,
            walletId,
            categoryId,
            amount: row.amount,
            date: installmentDate,
            description,
            tags: [] as string[],
            status: 'Pendente',
            type: row.type,
            isPaid: false,
            installmentNumber: i,
            totalInstallments: installmentInfo.totalInstallments,
            purchaseGroupId,
          });

          createdTransactions.push(created);
        }
      } else {
        const date = new Date(row.date);
        date.setHours(0, 0, 0, 0);

        const existing = await this.txRepo.findFirst({
          userId,
          walletId,
          date,
          amount: row.amount,
          description: row.description,
        });

        if (existing) {
          continue;
        }

        const created = await this.txRepo.create({
          userId,
          walletId,
          categoryId,
          amount: row.amount,
          date,
          description: row.description,
          tags: [] as string[],
          status: 'Pendente',
          type: row.type,
          isPaid: false,
        });

        createdTransactions.push(created);
      }
    }

    return createdTransactions;
  }

  private async resolveCategoryIdForNubank(
    userId: string,
    type: TransactionType,
    description: string,
  ): Promise<string> {
    const categories = await this.catRepo.findForNubank(userId, type);

    if (!categories.length) {
      const created = await this.catRepo.createDefault(
        userId,
        type === TransactionType.Receita ? 'Outras receitas' : 'Outras despesas',
        type,
      );
      return created.id;
    }

    const descLower = (description || '').toLowerCase();
    const byName = categories.find((cat) =>
      descLower.includes(cat.name.toLowerCase()),
    );
    if (byName) {
      return byName.id;
    }

    const outros = categories.find((cat) =>
      cat.name.toLowerCase().includes('outro'),
    );
    if (outros) {
      return outros.id;
    }

    return categories[0].id;
  }

  private parseNubankCsv(content: string): NubankParsedRow[] {
    const lines = content.split(/\r?\n/).map((line) => line.trim());
    const rows: NubankParsedRow[] = [];

    for (const line of lines) {
      if (!line || line.startsWith('date,')) {
        continue;
      }

      const match = line.match(/^([^,]+),(.*),([^,]+)$/);
      if (!match) {
        continue;
      }

      const dateStr = match[1].trim();
      let title = match[2].trim();
      const amountStr = match[3].trim();

      if (title.startsWith('"') && title.endsWith('"')) {
        title = title.slice(1, -1).replace(/""/g, '"');
      }

      const rawAmount = parseFloat(amountStr.replace(',', '.'));
      if (Number.isNaN(rawAmount)) {
        continue;
      }

      const type: TransactionType =
        rawAmount < 0 ? TransactionType.Receita : TransactionType.Despesa;
      const amount = Math.abs(rawAmount);

      const date = new Date(dateStr);

      rows.push({
        date,
        description: title,
        amount,
        type,
      });
    }

    return rows;
  }

  private parseNubankOfx(content: string): NubankParsedRow[] {
    const rows: NubankParsedRow[] = [];
    const parts = content.split('<STMTTRN>').slice(1);

    for (const part of parts) {
      const block = part.split('</STMTTRN>')[0];

      const trnTypeMatch = block.match(/<TRNTYPE>([^<]+)/);
      const dtPostedMatch = block.match(/<DTPOSTED>([^<]+)/);
      const trnAmtMatch = block.match(/<TRNAMT>([^<]+)/);
      const memoMatch = block.match(/<MEMO>([^<]+)/);

      if (!trnTypeMatch || !dtPostedMatch || !trnAmtMatch || !memoMatch) {
        continue;
      }

      const trnType = trnTypeMatch[1].trim();
      const dtPosted = dtPostedMatch[1].trim();
      const trnAmtStr = trnAmtMatch[1].trim();
      const memo = memoMatch[1].trim();

      const rawAmount = parseFloat(trnAmtStr.replace(',', '.'));
      if (Number.isNaN(rawAmount)) {
        continue;
      }

      const type: TransactionType =
        trnType.toUpperCase() === 'CREDIT'
          ? TransactionType.Receita
          : TransactionType.Despesa;
      const amount = Math.abs(rawAmount);

      const year = Number(dtPosted.slice(0, 4));
      const month = Number(dtPosted.slice(4, 6)) - 1;
      const day = Number(dtPosted.slice(6, 8));

      const date = new Date(year, month, day);

      rows.push({
        date,
        description: memo,
        amount,
        type,
      });
    }

    return rows;
  }

  private async parseNubankPdf(buffer: Buffer): Promise<NubankParsedRow[]> {
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    const text: string = result.text || '';

    const lines = text.split(/\r?\n/).map((line: string) => line.trim());
    const rows: NubankParsedRow[] = [];

    for (const line of lines) {
      const match = line.match(
        /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\d{1,3}(\.\d{3})*,\d{2})/,
      );

      if (!match) {
        continue;
      }

      const dateStr = match[1];
      const description = match[2].trim();
      const amountRawStr = match[3].replace(/\./g, '').replace(',', '.').trim();

      const rawAmount = parseFloat(amountRawStr);
      if (Number.isNaN(rawAmount)) {
        continue;
      }

      const type: TransactionType =
        rawAmount < 0 ? TransactionType.Receita : TransactionType.Despesa;
      const amount = Math.abs(rawAmount);

      const [dayStr, monthStr, yearStr] = dateStr.split('/');
      const day = Number(dayStr);
      const month = Number(monthStr) - 1;
      const year = Number(yearStr);

      const date = new Date(year, month, day);

      rows.push({
        date,
        description,
        amount,
        type,
      });
    }

    return rows;
  }

  private parseInstallmentInfo(description: string): {
    baseDescription: string;
    installmentNumber: number;
    totalInstallments: number;
  } | null {
    const match = description.match(/^(.*?)-\s*Parcela\s*(\d+)\s*\/\s*(\d+)/i);

    if (!match) {
      return null;
    }

    const baseDescription = match[1].trim();
    const installmentNumber = Number(match[2]);
    const totalInstallments = Number(match[3]);

    if (!installmentNumber || !totalInstallments) {
      return null;
    }

    return {
      baseDescription,
      installmentNumber,
      totalInstallments,
    };
  }
}
