import type { Wallet } from "../../types/wallet.type";
import type { Category } from "../categories/categories.type";
import type { RecurrenceFrequency } from "../../types/recurrence.type";

export type TransactionStatus = "Pendente" | "Pago" | "Cancelado";
export type TransactionType = "Receita" | "Despesa";

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  categoryId: string;
  amount: string; // Decimal como string
  currency: string;
  date: string;
  description?: string | null;
  status: TransactionStatus;
  type: TransactionType;
  tags: string[];
  isPaid: boolean;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  purchaseGroupId?: string | null;
  recurrenceId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Relações opcionais (quando incluídas pela API)
  wallet?: Wallet;
  category?: Category;
}

export interface CreateTransactionRequest {
  walletId: string;
  categoryId: string;
  amount: string;
  currency?: string;
  date: string;
  description?: string;
  status?: TransactionStatus;
  type: TransactionType;
  tags?: string[];
  isPaid?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  installments?: number;
  isRecurring?: boolean;
  frequency?: RecurrenceFrequency;
}

export interface TransactionsProps {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  onRefresh: () => void;
}
