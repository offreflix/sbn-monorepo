import { z } from 'zod'

// Full schema — used in CreateTransactionModal (create/edit, with installments and recurrence)
export const createTransactionSchema = z.object({
  walletId: z.string().min(1, 'Selecione uma carteira'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Valor deve ser um número positivo',
    ),
  date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().optional(),
  type: z.enum(['Receita', 'Despesa']),
  status: z.enum(['Pendente', 'Pago', 'Cancelado']).optional(),
  isPaid: z.boolean().optional(),
  installmentNumber: z.string().optional(),
  totalInstallments: z.string().optional(),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(['MONTHLY', 'WEEKLY']).default('MONTHLY'),
})

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>

// Simplified schema — used in TransactionForm (inline card form, no recurrence)
export const transactionFormSchema = z.object({
  walletId: z.string().min(1, 'Selecione uma carteira'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Valor deve ser um número positivo',
    ),
  date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().optional(),
  type: z.enum(['Receita', 'Despesa']),
  status: z.enum(['Pendente', 'Pago', 'Cancelado']).optional(),
  isPaid: z.boolean().optional(),
  installments: z
    .string()
    .default('1')
    .refine(
      (val) => !isNaN(parseInt(val)) && parseInt(val) >= 1,
      'Mínimo 1 parcela',
    ),
})

export type TransactionFormData = z.infer<typeof transactionFormSchema>
