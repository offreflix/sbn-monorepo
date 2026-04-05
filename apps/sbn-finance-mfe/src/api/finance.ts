import { request } from "./client";
import type {
  Wallet,
  CreateWalletRequest,
  UpdateWalletRequest,
} from "../types/wallet.type";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../pages/categories/categories.type";
import type {
  Transaction,
  CreateTransactionRequest,
} from "../pages/transactions/transactions.type";
import type {
  Recurrence,
  CreateRecurrenceRequest,
} from "../types/recurrence.type";
import type { Projection } from "../types/projection.type";
import type {
  DashboardSummary,
  DashboardCategories,
  DashboardYearOverview,
} from "../pages/dashboard/dashboard.type";

export const financeApi = {
  // Wallets
  wallets: {
    list: () => request<Wallet[]>("/api/finance/wallets", { method: "GET" }),
    get: (id: string) =>
      request<Wallet>(`/api/finance/wallets/${id}`, { method: "GET" }),
    create: (payload: CreateWalletRequest) =>
      request<Wallet>("/api/finance/wallets", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateWalletRequest) =>
      request<Wallet>(`/api/finance/wallets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<void>(`/api/finance/wallets/${id}`, { method: "DELETE" }),
  },

  // Transactions
  transactions: {
    list: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return request<Transaction[]>(`/api/finance/transactions${queryString}`, {
        method: "GET",
      });
    },
    summary: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return request<DashboardSummary>(
        `/api/finance/transactions/summary${queryString}`,
        { method: "GET" },
      );
    },
    create: (payload: CreateTransactionRequest) =>
      request<Transaction>("/api/finance/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<CreateTransactionRequest>) =>
      request<Transaction>(`/api/finance/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<void>(`/api/finance/transactions/${id}`, { method: "DELETE" }),
    importNubank: (walletId: string, file: File) => {
      const formData = new FormData();
      formData.append("walletId", walletId);
      formData.append("file", file);
      return request<void>("/api/finance/transactions/import/nubank", {
        method: "POST",
        body: formData,
      });
    },
  },

  // Categories
  categories: {
    list: () =>
      request<Category[]>("/api/finance/categories", { method: "GET" }),
    create: (payload: CreateCategoryRequest) =>
      request<Category>("/api/finance/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateCategoryRequest) =>
      request<Category>(`/api/finance/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<void>(`/api/finance/categories/${id}`, { method: "DELETE" }),
  },

  // Recurrences
  recurrences: {
    list: () =>
      request<Recurrence[]>("/api/finance/recurrences", { method: "GET" }),
    create: (payload: CreateRecurrenceRequest) =>
      request<Recurrence>("/api/finance/recurrences", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Projections
  projections: {
    get: (months?: number) => {
      const params = months ? `?months=${months}` : "";
      return request<Projection>(`/api/finance/projections${params}`, {
        method: "GET",
      });
    },
  },

  // Dashboard
  dashboard: {
    summary: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return request<DashboardSummary>(
        `/api/finance/dashboard/summary${queryString}`,
        { method: "GET" },
      );
    },
    categories: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return request<DashboardCategories>(
        `/api/finance/dashboard/categories${queryString}`,
        { method: "GET" },
      );
    },
    year: (year?: number) => {
      const params = new URLSearchParams();
      if (year) params.append("year", year.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return request<DashboardYearOverview>(
        `/api/finance/dashboard/year${queryString}`,
        { method: "GET" },
      );
    },
  },
};
