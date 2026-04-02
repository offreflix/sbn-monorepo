import type { Transaction, Wallet, Category } from "../../types/finance";

export interface TransactionsProps {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  onRefresh: () => void;
}
