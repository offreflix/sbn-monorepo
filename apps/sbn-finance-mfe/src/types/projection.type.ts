export interface Projection {
  months: number;
  totalIncome: string;
  totalExpense: string;
  balance: string;
  monthlyProjections: Array<{
    month: string;
    income: string;
    expense: string;
    balance: string;
  }>;
}
