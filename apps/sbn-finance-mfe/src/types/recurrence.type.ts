import type { TransactionType } from "../pages/transactions/transactions.type";

export type RecurrenceFrequency = "MONTHLY" | "WEEKLY";

export interface Recurrence {
  id: string;
  userId: string;
  walletId: string;
  categoryId: string;
  amount: string;
  currency: string;
  description?: string | null;
  type: TransactionType;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string | null;
  lastGenerated?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateRecurrenceRequest {
  walletId: string;
  categoryId: string;
  amount: string;
  currency?: string;
  description?: string;
  type: TransactionType;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
}
