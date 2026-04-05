import { z } from "zod";

// Used in WalletForm and CreateWalletModal
// limit is kept as string to match HTML number inputs (parsed to number on submit)
export const walletSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  currency: z.string().optional(),
  invoiceClosingDay: z.string().optional(),
  invoiceDueDay: z.string().optional(),
  limit: z.string().optional(),
});

export type WalletFormData = z.infer<typeof walletSchema>;
