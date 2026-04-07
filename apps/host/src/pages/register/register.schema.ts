import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
