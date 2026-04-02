import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { financeApi } from "../../api/finance";
import type { TransactionsProps } from "./transactions.type";
import type { Transaction } from "./transactions.type";

export function useTransactionsModel({
  transactions,
  wallets,
  categories,
  onRefresh,
}: TransactionsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importWalletId, setImportWalletId] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [walletFilter, setWalletFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;
      const matchesCategory =
        categoryFilter === "all" || t.categoryId === categoryFilter;
      const matchesWallet =
        walletFilter === "all" || t.walletId === walletFilter;
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      return matchesSearch && matchesCategory && matchesWallet && matchesType;
    });
  }, [transactions, searchTerm, categoryFilter, walletFilter, typeFilter]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    sorted.forEach((t) => {
      const dateKey = format(new Date(t.date), "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });

    return groups;
  }, [filteredTransactions]);

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await financeApi.transactions.delete(transactionToDelete.id);
      toast.success("Transação excluída com sucesso");
      onRefresh();
    } catch {
      toast.error("Erro ao excluir transação");
    } finally {
      setTransactionToDelete(null);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsCreateModalOpen(true);
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setIsCreateModalOpen(true);
  };

  const handleImportNubank = async () => {
    if (!importWalletId || !importFile) {
      toast.error("Selecione carteira e arquivo antes de importar");
      return;
    }

    try {
      setIsImporting(true);
      await financeApi.transactions.importNubank(importWalletId, importFile);
      toast.success("Fatura Nubank importada com sucesso");
      setIsImportModalOpen(false);
      setImportWalletId("");
      setImportFile(null);
      onRefresh();
    } catch {
      toast.error("Erro ao importar fatura Nubank");
    } finally {
      setIsImporting(false);
    }
  };

  return {
    data: {
      wallets,
      categories,
      groupedTransactions,
    },
    state: {
      isCreateModalOpen,
      editingTransaction,
      transactionToDelete,
      isImportModalOpen,
      importWalletId,
      importFile,
      isImporting,
      searchTerm,
      categoryFilter,
      walletFilter,
      typeFilter,
    },
    setters: {
      setIsCreateModalOpen,
      setEditingTransaction,
      setTransactionToDelete,
      setIsImportModalOpen,
      setImportWalletId,
      setImportFile,
      setSearchTerm,
      setCategoryFilter,
      setWalletFilter,
      setTypeFilter,
    },
    actions: {
      handleDelete,
      handleEdit,
      handleNewTransaction,
      handleImportNubank,
      onRefresh,
    },
  };
}

export type TransactionsModelOutput = ReturnType<typeof useTransactionsModel>;
