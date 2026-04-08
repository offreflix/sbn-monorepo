import { z } from 'zod'

export const createMealLogSchema = z.object({
  foodId: z.string().min(1, 'Selecione um alimento'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  amountConsumed: z
    .string()
    .min(1, 'Quantidade inválida')
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, {
      message: 'Quantidade inválida',
    }),
  unitConsumed: z.string().trim().min(1, 'Unidade é obrigatória'),
})

export type CreateMealLogFormValues = z.infer<typeof createMealLogSchema>
