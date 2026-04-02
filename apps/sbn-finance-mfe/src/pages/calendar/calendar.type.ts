import type { Transaction } from "../../pages/transactions/transactions.type";

export type CalendarMode =
  | "day"
  | "week"
  | "month"
  | "agenda"
  | "4days"
  | "year";

export interface CalendarProps {
  transactions: Transaction[];
  currentMonth: number; // 1-12
  currentYear: number;
}
