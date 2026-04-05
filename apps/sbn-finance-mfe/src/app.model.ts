import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { financeApi } from "./api/finance";
import type { Transaction } from "./pages/transactions/transactions.type";
import type { Wallet } from "./types/wallet.type";
import type { Category } from "./pages/categories/categories.type";

export function useAppModel() {
  const location = useLocation();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [txs, wls, cats] = await Promise.all([
        financeApi.transactions.list(selectedMonth, selectedYear),
        financeApi.wallets.list(),
        financeApi.categories.list(),
      ]);

      setTransactions(txs);
      setWallets(wls);
      setCategories(cats);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTransactionSuccess = () => {
    loadData();
  };

  const isTabActive = (path: string) => {
    if (path === "") {
      const isSubRoute =
        location.pathname.endsWith("/transactions") ||
        location.pathname.endsWith("/categories") ||
        location.pathname.endsWith("/calendar") ||
        location.pathname.includes("/wishlist");
      return !isSubRoute;
    }
    if (path === "wishlist") {
      return location.pathname.includes("/wishlist");
    }
    return location.pathname.endsWith(path);
  };

  const handleNavigate = (path: string) => {
    const currentPath = location.pathname;
    const segments = currentPath.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    const knownRoutes = ["transactions", "categories", "calendar", "wishlist"];
    const isCurrentlyInSubRoute = knownRoutes.includes(lastSegment);

    if (path === ".") {
      if (isCurrentlyInSubRoute) {
        navigate("..", { relative: "path", replace: true });
      }
    } else {
      if (isCurrentlyInSubRoute) {
        if (lastSegment !== path) {
          navigate(`../${path}`, { relative: "path", replace: true });
        }
      } else {
        navigate(path, { replace: true });
      }
    }
  };

  return {
    data: {
      transactions,
      wallets,
      categories,
    },
    state: {
      loading,
      selectedMonth,
      selectedYear,
    },
    setters: {
      setSelectedMonth,
      setSelectedYear,
    },
    actions: {
      loadData,
      handleTransactionSuccess,
      isTabActive,
      handleNavigate,
    },
  };
}

export type AppModelOutput = ReturnType<typeof useAppModel>;
