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
  Input,
  Label,
  Switch,
} from "@repo/ui";
import { financeApi, type Wallet, type Category } from "../api/finance";
import { wishlistApi, type WishlistItem } from "../api/wishlist";
import { toast } from "sonner";

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
  const [submitting, setSubmitting] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [date, setDate] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [hasInstallments, setHasInstallments] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "Despesa");

  // Load wallets and categories when modal opens
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

  // Pre-fill form when item changes
  useEffect(() => {
    if (open && item) {
      setDescription(item.name);
      setAmount(item.price?.toString() || "");
      setCategoryId("");
      setWalletId("");
      setDate(new Date().toISOString().split("T")[0]);
      setIsPaid(true);
      setHasInstallments(false);
      setTotalInstallments("");
    }
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletId || !categoryId || !amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!item) return;

    try {
      setSubmitting(true);

      await financeApi.transactions.create({
        walletId,
        categoryId,
        amount: parseFloat(amount).toString(),
        date: new Date(date).toISOString(),
        description,
        type: "Despesa",
        status: isPaid ? "Pago" : "Pendente",
        isPaid,
        currency: item.currency || "BRL",
        installmentNumber: hasInstallments ? 1 : undefined,
        totalInstallments: hasInstallments
          ? parseInt(totalInstallments)
          : undefined,
        installments: hasInstallments ? parseInt(totalInstallments) : undefined,
      });

      await wishlistApi.markAsPurchased(item.id);

      toast.success("Compra registrada e transação criada!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao registrar compra",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const installmentValue =
    hasInstallments && amount && totalInstallments
      ? (parseFloat(amount) / parseInt(totalInstallments || "1")).toFixed(2)
      : null;

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
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="purchase-description">Descrição</Label>
              <Input
                id="purchase-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase-date">Data *</Label>
                <Input
                  id="purchase-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
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
              </div>

              <div className="space-y-2">
                <Label>Carteira *</Label>
                <Select value={walletId} onValueChange={setWalletId}>
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
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="purchase-installments">Parcelar?</Label>
                <Switch
                  id="purchase-installments"
                  checked={hasInstallments}
                  onCheckedChange={(checked) => {
                    setHasInstallments(checked);
                    if (!checked) setTotalInstallments("");
                  }}
                />
              </div>
              {hasInstallments && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    placeholder="Qtd parcelas (ex: 12)"
                    type="number"
                    min="2"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="purchase-isPaid" className="text-base">
                    Já foi paga?
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Marque se o pagamento já foi efetivado
                  </p>
                </div>
                <Switch
                  id="purchase-isPaid"
                  checked={isPaid}
                  onCheckedChange={setIsPaid}
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
                {submitting ? "Registrando..." : "Confirmar Compra"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
