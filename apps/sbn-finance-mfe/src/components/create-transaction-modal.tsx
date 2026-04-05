import { useState, useEffect } from "react";
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
import { Input, Label, Switch } from "@repo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { financeApi } from "../api/finance";
import {
  createTransactionSchema,
  type CreateTransactionFormData,
} from "../pages/transactions/transactions.schema";
import type { Wallet } from "../types/wallet.type";
import type { Category } from "../pages/categories/categories.type";
import type {
  Transaction,
  CreateTransactionRequest,
} from "../pages/transactions/transactions.type";
import { toast } from "sonner";

interface CreateTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: Wallet[];
  categories: Category[];
  onSuccess: () => void;
  initialData?: Transaction | null;
}

export function CreateTransactionModal({
  open,
  onOpenChange,
  wallets,
  categories,
  onSuccess,
  initialData,
}: CreateTransactionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "Despesa",
      status: "Pendente",
      isPaid: false,
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      walletId: "",
      categoryId: "",
      isRecurring: false,
      frequency: "MONTHLY",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const isGrouped =
          initialData.totalInstallments && initialData.totalInstallments > 1;
        const displayAmount = isGrouped
          ? (
              Number(initialData.amount) * initialData.totalInstallments!
            ).toString()
          : initialData.amount.toString();
        const displayDescription = isGrouped
          ? (initialData.description ?? "").replace(/\s*\(\d+\/\d+\)$/, "")
          : (initialData.description ?? "");

        form.reset({
          walletId: initialData.walletId,
          categoryId: initialData.categoryId,
          amount: displayAmount,
          date: new Date(initialData.date).toISOString().split("T")[0],
          description: displayDescription,
          type: initialData.type,
          status: initialData.status,
          isPaid: initialData.isPaid,
          installmentNumber: initialData.installmentNumber?.toString(),
          totalInstallments: initialData.totalInstallments?.toString(),
          isRecurring: !!initialData.recurrenceId,
        });
      } else {
        form.reset({
          type: "Despesa",
          status: "Pendente",
          isPaid: false,
          date: new Date().toISOString().split("T")[0],
          description: "",
          amount: "",
          walletId: "",
          categoryId: "",
          isRecurring: false,
          frequency: "MONTHLY",
        });
      }
    }
  }, [open, initialData, form]);

  const selectedType = form.watch("type");
  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType,
  );
  const hasInstallments =
    form.watch("installmentNumber") && form.watch("totalInstallments");
  const isRecurring = form.watch("isRecurring");

  const onSubmit = async (data: CreateTransactionFormData) => {
    try {
      setSubmitting(true);
      const isEditingGroup =
        !!initialData &&
        !!initialData.totalInstallments &&
        initialData.totalInstallments > 1;

      const payload: CreateTransactionRequest = {
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: parseFloat(data.amount).toString(),
        date: new Date(data.date).toISOString(),
        description: data.description,
        type: data.type,
        status: data.isPaid ? "Pago" : data.status || "Pendente",
        isPaid: data.isPaid || false,
        currency: "BRL",
        totalInstallments: data.totalInstallments
          ? parseInt(data.totalInstallments)
          : isEditingGroup
            ? 1
            : undefined,
        // installmentNumber and installments are only relevant for creation
        installmentNumber:
          !initialData && data.installmentNumber
            ? parseInt(data.installmentNumber)
            : undefined,
        installments:
          !isEditingGroup &&
          data.installmentNumber === "1" &&
          data.totalInstallments
            ? parseInt(data.totalInstallments)
            : undefined,
        isRecurring: data.isRecurring,
        frequency: data.frequency,
      };

      if (initialData) {
        await financeApi.transactions.update(initialData.id, payload);
        toast.success("Transação atualizada com sucesso!");
      } else {
        await financeApi.transactions.create(payload);
        toast.success("Transação criada com sucesso!");
      }

      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar transação",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialData
              ? "Editar Transação"
              : "Criar nova despesa, ou cadastrar em lote"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Edite os detalhes da transação."
              : "Preencha os dados da nova transação."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="Compra no varejão"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(value) => form.setValue("categoryId", value)}
                disabled={filteredCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon || "💰"}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletId">Conta bancária</Label>
              <Select
                value={form.watch("walletId")}
                onValueChange={(value) => form.setValue("walletId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.walletId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.walletId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8" // Add padding for currency symbol if needed?
                  {...form.register("amount")}
                />
              </div>
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de transação</Label>
              <Select
                value={selectedType}
                onValueChange={(value: "Receita" | "Despesa") =>
                  form.setValue("type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita">Receita</SelectItem>
                  <SelectItem value="Despesa">
                    Despesa (Crédito/Débito)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Installments Logic */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasInstallments">Parcelar?</Label>
              <Switch
                id="hasInstallments"
                checked={!!hasInstallments}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    form.setValue("installmentNumber", undefined);
                    form.setValue("totalInstallments", undefined);
                  } else {
                    form.setValue("installmentNumber", "1");
                    form.setValue("totalInstallments", "1");
                  }
                }}
              />
            </div>
            {hasInstallments && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input
                  placeholder="Qtd Parcelas (ex: 12)"
                  type="number"
                  {...form.register("totalInstallments")}
                />
                <div className="flex items-center text-sm text-muted-foreground">
                  {form.watch("amount") && form.watch("totalInstallments")
                    ? `${form.watch("totalInstallments")}x de R$ ${(parseFloat(form.watch("amount")) / parseInt(form.watch("totalInstallments") || "1")).toFixed(2)}`
                    : null}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isRecurring" className="text-base">
                  É recorrente?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Selecione caso sua despesa for recorrente
                </p>
              </div>
              <Switch
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={(checked) =>
                  form.setValue("isRecurring", checked)
                }
              />
            </div>
            {isRecurring && (
              <div className="pt-2">
                <Label className="mb-2 block">Frequência</Label>
                <Select
                  value={form.watch("frequency")}
                  onValueChange={(val) =>
                    form.setValue("frequency", val as "MONTHLY" | "WEEKLY")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data da transação</Label>
            <Input id="date" type="date" {...form.register("date")} />
          </div>

          {/* Payment Status */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPaid" className="text-base">
                  Já foi paga?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Marque se a transação já foi efetivada na conta
                </p>
              </div>
              <Switch
                id="isPaid"
                checked={form.watch("isPaid") || false}
                onCheckedChange={(checked) => {
                  form.setValue("isPaid", checked);
                  form.setValue("status", checked ? "Pago" : "Pendente");
                }}
              />
            </div>
          </div>

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
              {submitting ? "Salvando..." : initialData ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
