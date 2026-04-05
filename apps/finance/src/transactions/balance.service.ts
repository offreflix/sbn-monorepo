import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client-finance';
import { WalletsRepository } from '../wallets/wallets.repository';

export type BalanceTx = {
  walletId: string;
  isPaid: boolean;
  type: string;
  amount: Prisma.Decimal | number | string;
};

@Injectable()
export class BalanceService {
  constructor(private walletsRepo: WalletsRepository) {}

  isCreditCard(walletType: string): boolean {
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
  shouldAffectBalance(
    walletIsCredit: boolean,
    isPaid: boolean,
    type: string,
  ): boolean {
    if (walletIsCredit && type === 'Despesa') {
      return !isPaid;
    }
    return isPaid;
  }

  async applyBalance(tx: BalanceTx, walletIsCredit: boolean): Promise<void> {
    if (this.shouldAffectBalance(walletIsCredit, tx.isPaid, tx.type)) {
      const increment =
        tx.type === 'Receita' ? Number(tx.amount) : -Number(tx.amount);
      await this.walletsRepo.updateBalance(tx.walletId, increment);
    }
  }

  async revertBalance(tx: BalanceTx, walletIsCredit: boolean): Promise<void> {
    if (this.shouldAffectBalance(walletIsCredit, tx.isPaid, tx.type)) {
      const revert =
        tx.type === 'Receita' ? -Number(tx.amount) : Number(tx.amount);
      await this.walletsRepo.updateBalance(tx.walletId, revert);
    }
  }

  async getWalletIsCredit(
    walletId: string,
    userId: string,
    fallback: boolean,
  ): Promise<boolean> {
    const wallet = await this.walletsRepo.findByIdAndUser(walletId, userId);
    return wallet ? this.isCreditCard(wallet.type) : fallback;
  }
}
