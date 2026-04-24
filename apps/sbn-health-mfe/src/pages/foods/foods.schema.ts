import { z } from "zod";

export const createFoodSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  brand: z.string().optional(),
  servingSizeValue: z
    .string()
    .min(1, "Porção inválida")
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, {
      message: "Porção inválida",
    }),
  servingSizeUnit: z.string().trim().min(1, "Unidade da porção é obrigatória"),
  caloriesPerServing: z
    .string()
    .min(1, "Calorias inválidas")
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, {
      message: "Calorias inválidas",
    }),
  proteinPerServing: z
    .string()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), {
      message: "Proteína inválida",
    }),
  carbsPerServing: z
    .string()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), {
      message: "Carboidratos inválidos",
    }),
  fatPerServing: z
    .string()
    .optional()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), {
      message: "Gordura inválida",
    }),
});

export type CreateFoodFormValues = z.infer<typeof createFoodSchema>;
