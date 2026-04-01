import type {
  Wallet,
  Category,
  Transaction,
} from "../../types/finance";

export interface DashboardProps {
  wallets: Wallet[];
  allCategories: Category[];
  transactions: Transaction[];
  globalLoading: boolean;
  onRefresh: () => void;
  selectedMonth: number;
  selectedYear: number;
}
