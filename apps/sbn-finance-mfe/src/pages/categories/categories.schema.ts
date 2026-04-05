import { z } from "zod";

// Used in CategoryForm and CreateCategoryModal
// isDefault is only used in CategoryForm (inline form), optional for the modal
export const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["Receita", "Despesa"]),
  icon: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
