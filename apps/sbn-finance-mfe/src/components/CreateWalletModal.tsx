import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { Input, Label } from "@repo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { financeApi } from "../api/finance";
import type { CreateWalletRequest } from "../types/finance";
import { toast } from "sonner";

const walletSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  currency: z.string().optional(),
  invoiceClosingDay: z.string().optional(),
  invoiceDueDay: z.string().optional(),
  limit: z.string().optional(),
});

type WalletFormData = z.infer<typeof walletSchema>;

interface CreateWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateWalletModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateWalletModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      currency: "BRL",
      type: "Conta Corrente",
    },
  });

  const walletType = form.watch("type");
  const isCredit =
    walletType.toLowerCase().includes("crédito") || walletType === "credit";

  const onSubmit = async (data: WalletFormData) => {
    try {
      setSubmitting(true);
      const payload: CreateWalletRequest = {
        name: data.name,
        type: data.type,
        currency: data.currency || "BRL",
        invoiceClosingDay: data.invoiceClosingDay
          ? parseInt(data.invoiceClosingDay)
          : undefined,
        invoiceDueDay: data.invoiceDueDay
          ? parseInt(data.invoiceDueDay)
          : undefined,
        limit: data.limit ? parseFloat(data.limit) : undefined,
      };

      await financeApi.wallets.create(payload);
      toast.success("Carteira criada com sucesso!");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar carteira",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Carteira</DialogTitle>
          <DialogDescription>
            Adicione uma nova carteira para gerenciar suas finanças.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Carteira</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Ex: Conta Corrente"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                <SelectItem value="Poupança">Poupança</SelectItem>
                <SelectItem value="Cartão de Crédito">
                  Cartão de Crédito
                </SelectItem>
                <SelectItem value="Investimento">Investimento</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          {isCredit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="limit">Limite (R$)</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("limit")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closing_day">Dia de Fechamento</Label>
                  <Input
                    id="closing_day"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="15"
                    {...form.register("invoiceClosingDay")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_day">Dia de Vencimento</Label>
                  <Input
                    id="due_day"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="22"
                    {...form.register("invoiceDueDay")}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Criar Carteira"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
