import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Input,
  Label,
  Switch,
} from "@repo/ui";
import { financeApi } from "../api/finance";
import type { Wallet } from "../types/wallet.type";
import type { Category } from "../pages/categories/categories.type";
import { wishlistApi } from "../api/wishlist";
import type { WishlistItem } from "../pages/wishlist/wishlist.type";
import { toast } from "sonner";
import {
  purchaseTransactionSchema,
  type PurchaseTransactionFormData,
} from "../pages/wishlist/wishlist.schema";

interface PurchaseTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WishlistItem | null;
  onSuccess: () => void;
}

export function PurchaseTransactionModal({
  open,
  onOpenChange,
  item,
  onSuccess,
}: PurchaseTransactionModalProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const form = useForm<PurchaseTransactionFormData>({
    resolver: zodResolver(purchaseTransactionSchema),
    defaultValues: {
      description: "",
      amount: "",
      date: "",
      categoryId: "",
      walletId: "",
      isPaid: true,
      hasInstallments: false,
      totalInstallments: "",
    },
  });

  const hasInstallments = form.watch("hasInstallments");
  const amount = form.watch("amount");
  const totalInstallments = form.watch("totalInstallments");

  const expenseCategories = categories.filter((c) => c.type === "Despesa");

  const installmentValue =
    hasInstallments && amount && totalInstallments
      ? (parseFloat(amount) / parseInt(totalInstallments || "1")).toFixed(2)
      : null;

  useEffect(() => {
    if (!open) return;
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [wls, cats] = await Promise.all([
          financeApi.wallets.list(),
          financeApi.categories.list(),
        ]);
        setWallets(wls);
        setCategories(cats);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar carteiras e categorias");
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [open]);

  useEffect(() => {
    if (open && item) {
      form.reset({
        description: item.name,
        amount: item.price?.toString() ?? "",
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
        walletId: "",
        isPaid: true,
        hasInstallments: false,
        totalInstallments: "",
      });
    }
  }, [open, item, form]);

  const onSubmit = async (data: PurchaseTransactionFormData) => {
    if (!item) return;
    try {
      await financeApi.transactions.create({
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: parseFloat(data.amount).toString(),
        date: new Date(data.date).toISOString(),
        description: data.description,
        type: "Despesa",
        status: data.isPaid ? "Pago" : "Pendente",
        isPaid: data.isPaid,
        currency: item.currency || "BRL",
        installmentNumber: data.hasInstallments ? 1 : undefined,
        totalInstallments: data.hasInstallments
          ? parseInt(data.totalInstallments ?? "1")
          : undefined,
        installments: data.hasInstallments
          ? parseInt(data.totalInstallments ?? "1")
          : undefined,
      });
      await wishlistApi.markAsPurchased(item.id);
      toast.success("Compra registrada e transação criada!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao registrar compra",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Registrar Compra
          </DialogTitle>
          <DialogDescription>
            Lançar a compra de "{item?.name}" como despesa no financeiro.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="purchase-description">Descrição</Label>
              <Input
                id="purchase-description"
                {...form.register("description")}
                placeholder="Descrição da compra"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase-amount">Valor *</Label>
                <Input
                  id="purchase-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("amount")}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase-date">Data *</Label>
                <Input
                  id="purchase-date"
                  type="date"
                  {...form.register("date")}
                />
                {form.formState.errors.date && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={form.watch("categoryId")}
                  onValueChange={(value) =>
                    form.setValue("categoryId", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon || "💰"}</span>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Carteira *</Label>
                <Select
                  value={form.watch("walletId")}
                  onValueChange={(value) =>
                    form.setValue("walletId", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
                  <p className="text-sm text-destructive">
                    {form.formState.errors.walletId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="purchase-installments">Parcelar?</Label>
                <Switch
                  id="purchase-installments"
                  checked={hasInstallments}
                  onCheckedChange={(checked) => {
                    form.setValue("hasInstallments", checked);
                    if (!checked) form.setValue("totalInstallments", "");
                  }}
                />
              </div>
              {hasInstallments && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    placeholder="Qtd parcelas (ex: 12)"
                    type="number"
                    min="2"
                    {...form.register("totalInstallments")}
                  />
                  <div className="flex items-center text-sm text-muted-foreground">
                    {installmentValue
                      ? `${totalInstallments}x de R$ ${installmentValue}`
                      : null}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                A transação será lançada como despesa e o item da wishlist será
                marcado como comprado.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Registrar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
