import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  expiresAt: z.string().optional(),
});

export type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;
