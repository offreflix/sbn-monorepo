import { z } from 'zod'

// Used in PurchaseTransactionModal — register a wishlist item purchase as a finance transaction
export const purchaseTransactionSchema = z.object({
  description: z.string().optional(),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Valor deve ser um número positivo',
    ),
  date: z.string().min(1, 'Data é obrigatória'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  walletId: z.string().min(1, 'Selecione uma carteira'),
  isPaid: z.boolean().default(true),
  hasInstallments: z.boolean().default(false),
  totalInstallments: z.string().optional(),
})

export type PurchaseTransactionFormData = z.infer<typeof purchaseTransactionSchema>
