import { useState } from "react";
import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui";
import {
  Plus,
  CreditCard,
  Landmark,
  Wallet,
  PiggyBank,
  Banknote,
  TrendingUp,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Wallet as WalletType } from "../types/finance";
import { CreateWalletModal } from "./CreateWalletModal";
import { financeApi } from "../api/finance";
import { toast } from "sonner";

interface WalletCardsProps {
  wallets: WalletType[];
  onRefresh: () => void;
}

export function WalletCards({ wallets, onRefresh }: WalletCardsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<WalletType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBalances, setShowBalances] = useState(true);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const hiddenValue = "•••••";

  const getWalletIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("crédito") || t.includes("credit")) {
      return <CreditCard className="h-5 w-5" />;
    }
    if (t.includes("poupança") || t.includes("savings")) {
      return <PiggyBank className="h-5 w-5" />;
    }
    if (t.includes("investimento") || t.includes("investment")) {
      return <TrendingUp className="h-5 w-5" />;
    }
    if (t.includes("dinheiro") || t.includes("cash")) {
      return <Banknote className="h-5 w-5" />;
    }
    if (t.includes("banco") || t.includes("bank") || t.includes("corrente")) {
      return <Landmark className="h-5 w-5" />;
    }
    return <Wallet className="h-5 w-5" />;
  };

  const getWalletAccent = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("crédito") || t.includes("credit")) {
      return {
        bg: "bg-orange-500/20",
        text: "text-orange-400",
        border: "border-orange-500/30",
      };
    }
    if (t.includes("poupança") || t.includes("savings")) {
      return {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
      };
    }
    if (t.includes("investimento") || t.includes("investment")) {
      return {
        bg: "bg-purple-500/20",
        text: "text-purple-400",
        border: "border-purple-500/30",
      };
    }
    return {
      bg: "bg-primary/20",
      text: "text-primary",
      border: "border-primary/30",
    };
  };

  const handleDelete = async () => {
    if (!deletingWallet) return;
    try {
      setIsDeleting(true);
      await financeApi.wallets.delete(deletingWallet.id);
      toast.success("Carteira excluída com sucesso!");
      setDeletingWallet(null);
      onRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir carteira",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const totalBalance = wallets
    .filter((w) => !w.type.toLowerCase().includes("crédito"))
    .reduce((acc, w) => acc + parseFloat(w.balance), 0);

  const totalCredit = wallets
    .filter((w) => w.type.toLowerCase().includes("crédito"))
    .reduce((acc, w) => {
      const limit = w.limit ? parseFloat(w.limit) : 0;
      const balance = parseFloat(w.balance);
      return acc + (limit + balance);
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBalances(!showBalances)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          {showBalances ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {showBalances ? "Ocultar saldos" : "Mostrar saldos"}
        </Button>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Carteira
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Saldo Total
          </p>
          <p className="text-xl font-semibold text-primary tabular-nums">
            {showBalances ? formatCurrency(totalBalance) : hiddenValue}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Crédito Disponível
          </p>
          <p className="text-xl font-semibold text-orange-400 tabular-nums">
            {showBalances ? formatCurrency(totalCredit) : hiddenValue}
          </p>
        </div>
      </div>

      {/* Wallet List */}
      <div className="space-y-3">
        {wallets.map((wallet) => {
          const balance = parseFloat(wallet.balance);
          const isCredit = wallet.type.toLowerCase().includes("crédito");
          const limit = wallet.limit ? parseFloat(wallet.limit) : 0;
          const availableCredit = isCredit ? limit + balance : 0;
          const usedCredit = isCredit ? Math.abs(balance) : 0;
          const usagePercent =
            isCredit && limit > 0 ? (usedCredit / limit) * 100 : 0;
          const accent = getWalletAccent(wallet.type);

          return (
            <div
              key={wallet.id}
              className="glass-dark rounded-xl p-4 hover:border-white/15 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                {/* Left side - Icon and info */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${accent.bg} ${accent.text} flex items-center justify-center`}
                  >
                    {getWalletIcon(wallet.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {wallet.name}
                    </h4>
                    <p className="text-xs text-muted-foreground capitalize">
                      {wallet.type}
                    </p>
                  </div>
                </div>

                {/* Right side - Balance + actions */}
                <div className="flex items-start gap-2">
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold tabular-nums ${
                        isCredit
                          ? "text-orange-400"
                          : balance >= 0
                            ? "text-primary"
                            : "text-red-400"
                      }`}
                    >
                      {showBalances
                        ? isCredit
                          ? formatCurrency(availableCredit)
                          : formatCurrency(balance)
                        : hiddenValue}
                    </p>
                    {isCredit && (
                      <p className="text-xs text-muted-foreground">
                        {showBalances
                          ? `Limite: ${formatCurrency(limit)}`
                          : "Limite: •••••"}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditingWallet(wallet)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeletingWallet(wallet)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Credit card usage bar */}
              {isCredit && limit > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Utilizado</span>
                    <span>
                      {showBalances
                        ? `${formatCurrency(usedCredit)} (${usagePercent.toFixed(0)}%)`
                        : "•••••"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        usagePercent > 80
                          ? "bg-red-500"
                          : usagePercent > 50
                            ? "bg-yellow-500"
                            : "bg-orange-400"
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {wallets.length === 0 && (
          <div className="glass-dark rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-6 w-6" />
            </div>
            <h4 className="font-medium text-foreground mb-1">
              Nenhuma carteira cadastrada
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione sua primeira carteira para começar a controlar suas
              finanças
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Carteira
            </Button>
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateWalletModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          onRefresh();
        }}
      />

      {/* Edit modal */}
      <CreateWalletModal
        open={!!editingWallet}
        onOpenChange={(open) => !open && setEditingWallet(null)}
        initialData={editingWallet ?? undefined}
        onSuccess={() => {
          setEditingWallet(null);
          onRefresh();
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingWallet}
        onOpenChange={(open) => !open && setDeletingWallet(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Carteira</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a carteira{" "}
              <strong>{deletingWallet?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
