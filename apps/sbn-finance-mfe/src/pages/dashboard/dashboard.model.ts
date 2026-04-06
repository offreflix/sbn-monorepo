import { useState, useEffect, useCallback } from "react";
import type { DashboardProps } from "./dashboard.type";
import { financeApi } from "../../api/finance";
import type { DashboardSummary, DashboardCategories } from "./dashboard.type";
import type { Recurrence } from "../recurrences/recurrences.type";
import { toast } from "sonner";

export function useDashboardModel(props: DashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary>({
    cards: { balance: 0, currentInvoice: 0, nextInvoice: 0, totalInvoices: 0 },
    overview: { income: 0, expense: 0, balance: 0 },
  });
  const [categories, setCategories] = useState<DashboardCategories>({
    income: [],
    expense: [],
  });
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const [dashSum, dashCats, recList] = await Promise.all([
        financeApi.dashboard.summary(props.selectedMonth, props.selectedYear),
        financeApi.dashboard.categories(
          props.selectedMonth,
          props.selectedYear,
        ),
        financeApi.recurrences.list(),
      ]);
      setSummary(dashSum);
      setCategories(dashCats);
      setRecurrences(recList);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      toast.error("Erro ao carregar resumo do dashboard.");
    } finally {
      setDashboardLoading(false);
    }
  }, [props.selectedMonth, props.selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    await fetchDashboardData();
    props.onRefresh();
  };

  return {
    data: {
      summary,
      categories,
      recurrences,
      wallets: props.wallets,
      allCategories: props.allCategories,
      transactions: props.transactions,
    },
    state: {
      loading: props.globalLoading || dashboardLoading,
    },
    actions: {
      onRefresh: handleRefresh,
    },
  };
}

export type DashboardModelOutput = ReturnType<typeof useDashboardModel>;
