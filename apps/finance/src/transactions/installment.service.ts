import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client-finance';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';
import { BalanceService } from './balance.service';

export type InstallmentTransaction = Prisma.TransactionGetPayload<{
  include: { wallet: true; category: true };
}>;

type InstallmentUpdateParams = {
  id: string;
  userId: string;
  data: UpdateTransactionDto;
  transaction: InstallmentTransaction;
  isPaid: boolean;
  status: string;
};

@Injectable()
export class InstallmentService {
  constructor(
    private txRepo: TransactionsRepository,
    private balanceSvc: BalanceService,
  ) {}

  private findOne(id: string, userId: string) {
    return this.txRepo.findFirst(
      { id, userId },
      { wallet: true, category: true },
    );
  }

  /**
   * Single entry point for the TransactionsService.
   * Returns the updated transaction if this is an installment scenario,
   * or null if the caller should handle it as a plain single-transaction update.
   */
  async resolveUpdate(
    params: InstallmentUpdateParams,
  ): Promise<InstallmentTransaction | Transaction | null> {
    if (params.transaction.purchaseGroupId) {
      return this.updateInstallmentGroup(params);
    }
    if (params.data.installments && params.data.installments > 1) {
      return this.convertToInstallmentGroup(params);
    }
    return null;
  }

  private async convertToInstallmentGroup({
    id,
    userId,
    data,
    transaction,
    isPaid,
    status,
  }: InstallmentUpdateParams): Promise<InstallmentTransaction | null> {
    const installments = data.installments!;
    const totalAmount =
      data.amount !== undefined ? data.amount : Number(transaction.amount);
    const installmentAmount = totalAmount / installments;

    const walletIsCredit = this.balanceSvc.isCreditCard(
      transaction.wallet?.type ?? '',
    );

    await this.balanceSvc.revertBalance(
      {
        walletId: transaction.walletId,
        isPaid: transaction.isPaid,
        type: transaction.type,
        amount: transaction.amount,
      },
      walletIsCredit,
    );

    const purchaseGroupId = crypto.randomUUID();
    const baseDate = new Date(data.date ?? transaction.date);
    const walletIdToUse = data.walletId ?? transaction.walletId;
    const categoryIdToUse = data.categoryId ?? transaction.categoryId;
    const typeToUse = data.type ?? transaction.type;
    const stripSuffix = (desc: string) =>
      (desc ?? '').replace(/\s*\(\d+\/\d+\)$/, '').trim();
    const baseDesc =
      data.description !== undefined
        ? stripSuffix(data.description)
        : stripSuffix(transaction.description ?? '');

    await this.txRepo.update(id, {
      amount: installmentAmount,
      date: baseDate,
      description: `${baseDesc} (1/${installments})`,
      wallet: { connect: { id: walletIdToUse } },
      category: { connect: { id: categoryIdToUse } },
      type: typeToUse,
      isPaid,
      status,
      installmentNumber: 1,
      totalInstallments: installments,
      purchaseGroupId,
    });

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

    const newGroup = await this.txRepo.findByPurchaseGroup(
      purchaseGroupId,
      userId,
    );
    for (const tx of newGroup) {
      await this.balanceSvc.applyBalance(
        {
          walletId: tx.walletId,
          isPaid: tx.isPaid,
          type: tx.type,
          amount: tx.amount,
        },
        walletIsCredit,
      );
    }

    return this.findOne(id, userId);
  }

  private async convertGroupToSingle(
    params: InstallmentUpdateParams & { allInGroup: Transaction[] },
  ): Promise<Transaction> {
    const { id, userId, data, transaction, allInGroup, isPaid, status } =
      params;
    const walletIsCredit = this.balanceSvc.isCreditCard(
      transaction.wallet?.type ?? '',
    );

    for (const tx of allInGroup) {
      await this.balanceSvc.revertBalance(
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
      id: { not: id },
    });

    const currentTotalAmount = Number(allInGroup[0].amount) * allInGroup.length;
    const totalAmount =
      data.amount !== undefined ? data.amount : currentTotalAmount;

    const stripSuffix = (desc: string) =>
      (desc ?? '').replace(/\s*\(\d+\/\d+\)$/, '').trim();
    const singleDesc =
      data.description !== undefined
        ? stripSuffix(data.description)
        : stripSuffix(transaction.description ?? '');

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

    const walletIdToUse = data.walletId ?? transaction.walletId;
    const nextWalletIsCredit = data.walletId
      ? await this.balanceSvc.getWalletIsCredit(
          walletIdToUse,
          userId,
          walletIsCredit,
        )
      : walletIsCredit;

    await this.balanceSvc.applyBalance(
      {
        walletId: updated.walletId,
        isPaid: updated.isPaid,
        type: updated.type,
        amount: updated.amount,
      },
      nextWalletIsCredit,
    );

    return updated;
  }

  private async updateInstallmentGroup({
    id,
    userId,
    data,
    transaction,
    isPaid,
    status,
  }: InstallmentUpdateParams): Promise<InstallmentTransaction | Transaction | null> {
    const allInGroup = await this.txRepo.findByPurchaseGroup(
      transaction.purchaseGroupId!,
      userId,
      { orderBy: { installmentNumber: 'asc' } },
    );

    const currentCount = allInGroup.length;
    const newCount = data.totalInstallments ?? currentCount;

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

    const currentTotalAmount = Number(allInGroup[0].amount) * currentCount;
    const newTotalAmount =
      data.amount !== undefined ? data.amount : currentTotalAmount;
    const newInstallmentAmount = newTotalAmount / newCount;

    const stripSuffix = (desc: string) =>
      (desc ?? '').replace(/\s*\(\d+\/\d+\)$/, '').trim();
    const newBaseDesc =
      data.description !== undefined
        ? stripSuffix(data.description)
        : stripSuffix(transaction.description ?? '');

    const groupWalletIsCredit = this.balanceSvc.isCreditCard(
      transaction.wallet?.type ?? '',
    );

    const toRevert = allInGroup.filter((t) =>
      this.balanceSvc.shouldAffectBalance(
        groupWalletIsCredit,
        t.isPaid,
        t.type,
      ),
    );
    for (const t of toRevert) {
      await this.balanceSvc.revertBalance(
        {
          walletId: t.walletId,
          isPaid: t.isPaid,
          type: t.type,
          amount: t.amount,
        },
        groupWalletIsCredit,
      );
    }

    if (newCount < currentCount) {
      await this.txRepo.deleteMany({
        purchaseGroupId: transaction.purchaseGroupId,
        userId,
        installmentNumber: { gt: newCount },
      });
    }

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

      if (tx.id === id) {
        txData.isPaid = isPaid;
        txData.status = status;
        if (data.date) txData.date = new Date(data.date);
      }

      await this.txRepo.update(tx.id, txData);
    }

    const updatedGroup = await this.txRepo.findByPurchaseGroup(
      transaction.purchaseGroupId!,
      userId,
    );
    const toApply = updatedGroup.filter((t) =>
      this.balanceSvc.shouldAffectBalance(
        groupWalletIsCredit,
        t.isPaid,
        t.type,
      ),
    );
    for (const t of toApply) {
      await this.balanceSvc.applyBalance(
        {
          walletId: t.walletId,
          isPaid: t.isPaid,
          type: t.type,
          amount: t.amount,
        },
        groupWalletIsCredit,
      );
    }

    return this.findOne(id, userId);
  }
}
