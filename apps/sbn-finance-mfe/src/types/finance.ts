// Tipos baseados no schema Prisma do sbn-finance

export type TransactionStatus = 'Pendente' | 'Pago' | 'Cancelado'
export type TransactionType = 'Receita' | 'Despesa'
export type CategoryType = 'Receita' | 'Despesa'
export type RecurrenceFrequency = 'MONTHLY' | 'WEEKLY'

export interface Wallet {
  id: string
  userId: string
  name: string
  type: string
  balance: string // Decimal como string
  currency: string
  isActive: boolean
  invoiceClosingDay?: number | null
  invoiceDueDay?: number | null
  limit?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface Category {
  id: string
  userId?: string | null
  name: string
  type: CategoryType
  icon?: string | null
  color?: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface Transaction {
  id: string
  userId: string
  walletId: string
  categoryId: string
  amount: string // Decimal como string
  currency: string
  date: string
  description?: string | null
  status: TransactionStatus
  type: TransactionType
  tags: string[]
  isPaid: boolean
  installmentNumber?: number | null
  totalInstallments?: number | null
  purchaseGroupId?: string | null
  recurrenceId?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  // Relações opcionais (quando incluídas pela API)
  wallet?: Wallet
  category?: Category
}

export interface Recurrence {
  id: string
  userId: string
  walletId: string
  categoryId: string
  amount: string
  currency: string
  description?: string | null
  type: TransactionType
  frequency: RecurrenceFrequency
  startDate: string
  endDate?: string | null
  lastGenerated?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface Projection {
  months: number
  totalIncome: string
  totalExpense: string
  balance: string
  monthlyProjections: Array<{
    month: string
    income: string
    expense: string
    balance: string
  }>
}

// DTOs para requests
export interface CreateWalletRequest {
  name: string
  type: string
  currency?: string
  invoiceClosingDay?: number
  invoiceDueDay?: number
  limit?: string
}

export interface CreateTransactionRequest {
  walletId: string
  categoryId: string
  amount: string
  currency?: string
  date: string
  description?: string
  status?: TransactionStatus
  type: TransactionType
  tags?: string[]
  isPaid?: boolean
  installmentNumber?: number
  totalInstallments?: number
}

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  icon?: string
  color?: string
  isDefault?: boolean
}

export interface CreateRecurrenceRequest {
  walletId: string
  categoryId: string
  amount: string
  currency?: string
  description?: string
  type: TransactionType
  frequency: RecurrenceFrequency
  startDate: string
  endDate?: string
}
