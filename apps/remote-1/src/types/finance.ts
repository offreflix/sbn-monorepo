// Tipos baseados no schema Prisma do sbn-finance

export type TransactionStatus = 'Pendente' | 'Pago' | 'Cancelado'
export type TransactionType = 'Receita' | 'Despesa'
export type CategoryType = 'Receita' | 'Despesa'
export type RecurrenceFrequency = 'MONTHLY' | 'WEEKLY'

export interface Wallet {
  id: string
  user_id: string
  name: string
  type: string
  balance: string // Decimal como string
  currency: string
  is_active: boolean
  invoice_closing_day?: number | null
  invoice_due_day?: number | null
  limit?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Category {
  id: string
  user_id?: string | null
  name: string
  type: CategoryType
  icon?: string | null
  color?: string | null
  is_default: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Transaction {
  id: string
  user_id: string
  wallet_id: string
  category_id: string
  amount: string // Decimal como string
  currency: string
  date: string
  description?: string | null
  status: TransactionStatus
  type: TransactionType
  tags: string[]
  is_paid: boolean
  installment_number?: number | null
  total_installments?: number | null
  purchase_group_id?: string | null
  recurrence_id?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  // Relações opcionais (quando incluídas pela API)
  wallet?: Wallet
  category?: Category
}

export interface Recurrence {
  id: string
  user_id: string
  wallet_id: string
  category_id: string
  amount: string
  currency: string
  description?: string | null
  type: TransactionType
  frequency: RecurrenceFrequency
  start_date: string
  end_date?: string | null
  last_generated?: string | null
  active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
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
  invoice_closing_day?: number
  invoice_due_day?: number
  limit?: string
}

export interface CreateTransactionRequest {
  wallet_id: string
  category_id: string
  amount: string
  currency?: string
  date: string
  description?: string
  status?: TransactionStatus
  type: TransactionType
  tags?: string[]
  is_paid?: boolean
  installment_number?: number
  total_installments?: number
}

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  icon?: string
  color?: string
  is_default?: boolean
}

export interface CreateRecurrenceRequest {
  wallet_id: string
  category_id: string
  amount: string
  currency?: string
  description?: string
  type: TransactionType
  frequency: RecurrenceFrequency
  start_date: string
  end_date?: string
}

