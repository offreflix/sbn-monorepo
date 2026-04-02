import type { Wallet } from "../../types/wallet.type";
import type { Category } from "../categories/categories.type";
import type { Transaction } from "../transactions/transactions.type";

export interface DashboardSummary {
  cards: {
    balance: number;
    currentInvoice: number;
    nextInvoice: number;
    totalInvoices: number;
  };
  overview: {
    income: number;
    expense: number;
    balance: number;
  };
}

export interface DashboardCategory {
  name: string;
  value: number;
  percentage: number;
}

export interface DashboardCategories {
  income: DashboardCategory[];
  expense: DashboardCategory[];
}

export interface DashboardYearOverviewMonth {
  month: number;
  income: number;
  expense: number;
  balance: number;
  days?: DashboardYearOverviewDay[];
}

export interface DashboardYearOverviewDay {
  day: number;
  income: number;
  expense: number;
  balance: number;
}

export interface DashboardYearOverview {
  year: number;
  months: DashboardYearOverviewMonth[];
  totals: {
    income: number;
    expense: number;
    balance: number;
  };
}

export interface DashboardProps {
  wallets: Wallet[];
  allCategories: Category[];
  transactions: Transaction[];
  globalLoading: boolean;
  onRefresh: () => void;
  selectedMonth: number;
  selectedYear: number;
}
