export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: string; // Decimal como string
  currency: string;
  isActive: boolean;
  invoiceClosingDay?: number | null;
  invoiceDueDay?: number | null;
  limit?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateWalletRequest {
  name: string;
  type: string;
  currency?: string;
  invoiceClosingDay?: number;
  invoiceDueDay?: number;
  limit?: number;
}

export interface UpdateWalletRequest {
  name?: string;
  type?: string;
  currency?: string;
  invoiceClosingDay?: number;
  invoiceDueDay?: number;
  limit?: number;
  isActive?: boolean;
}
