import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private repo: DashboardRepository) {}

  async getSummary(userId: string, month: number, year: number) {
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const allWallets = await this.repo.findWalletsByUser(userId);

    const isCreditCard = (type: string) =>
      type.toLowerCase().includes('crédito') ||
      type.toLowerCase().includes('credito') ||
      type.toLowerCase() === 'credit_card' ||
      type.toLowerCase() === 'credit card';

    const wallets = allWallets.filter((w) => !isCreditCard(w.type));
    const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

    // Credit Card Invoices
    const creditCards = allWallets.filter((w) => isCreditCard(w.type));

    let currentInvoice = 0;
    let nextInvoice = 0;
    let totalInvoices = 0;

    const ccTransactions =
      creditCards.length > 0
        ? await this.repo.findCcTransactionsByMonth(
            userId,
            creditCards.map((c) => c.id),
            currentMonth,
            currentYear,
          )
        : [];

    for (const tx of ccTransactions) {
      totalInvoices += Number(tx.amount);

      const wallet = creditCards.find((c) => c.id === tx.walletId);
      if (wallet && wallet.invoiceClosingDay) {
        const txDate = new Date(tx.date);
        const closingDateCurrentMonth = new Date(
          currentYear,
          currentMonth - 1,
          wallet.invoiceClosingDay,
        );
        const closingDatePrevious = new Date(
          currentYear,
          currentMonth - 2,
          wallet.invoiceClosingDay,
        );

        if (txDate > closingDatePrevious && txDate <= closingDateCurrentMonth) {
          currentInvoice += Number(tx.amount);
        } else if (txDate > closingDateCurrentMonth) {
          nextInvoice += Number(tx.amount);
        }
      } else {
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0);
        endDate.setHours(23, 59, 59, 999);

        const txDate = new Date(tx.date);
        if (txDate >= startDate && txDate <= endDate) {
          currentInvoice += Number(tx.amount);
        } else if (txDate > endDate) {
          nextInvoice += Number(tx.amount);
        }
      }
    }

    // Overview (Income vs Expense)
    const monthTransactions = await this.repo.findMonthTransactions(
      userId,
      currentMonth,
      currentYear,
    );

    const income = monthTransactions
      .filter((t) => t.type === 'Receita')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'Despesa')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return {
      cards: {
        balance: totalBalance,
        currentInvoice,
        nextInvoice,
        totalInvoices,
      },
      overview: {
        income,
        expense,
        balance: income - expense,
      },
    };
  }

  async getYearOverview(userId: string, year: number) {
    const targetYear = year || new Date().getFullYear();
    const transactions = await this.repo.findYearTransactions(
      userId,
      targetYear,
    );

    const months = Array.from({ length: 12 }, () => ({
      income: 0,
      expense: 0,
      balance: 0,
      days: new Map<number, { income: number; expense: number }>(),
    }));

    for (const tx of transactions) {
      const m = new Date(tx.date).getMonth();
      const amount = Number(tx.amount);
      if (tx.type === 'Receita') {
        months[m].income += amount;
        const d = new Date(tx.date).getDate();
        const day = months[m].days.get(d) || { income: 0, expense: 0 };
        day.income += amount;
        months[m].days.set(d, day);
      } else {
        months[m].expense += amount;
        const d = new Date(tx.date).getDate();
        const day = months[m].days.get(d) || { income: 0, expense: 0 };
        day.expense += amount;
        months[m].days.set(d, day);
      }
    }

    months.forEach((m) => {
      m.balance = m.income - m.expense;
    });

    const totals = months.reduce(
      (acc, m) => {
        acc.income += m.income;
        acc.expense += m.expense;
        return acc;
      },
      { income: 0, expense: 0 },
    );

    return {
      year: targetYear,
      months: months.map((m, idx) => {
        const days = Array.from(m.days.entries())
          .map(([day, agg]) => ({
            day,
            income: agg.income,
            expense: agg.expense,
            balance: agg.income - agg.expense,
          }))
          .sort((a, b) => a.day - b.day);
        return {
          month: idx + 1,
          income: m.income,
          expense: m.expense,
          balance: m.balance,
          days,
        };
      }),
      totals: {
        income: totals.income,
        expense: totals.expense,
        balance: totals.income - totals.expense,
      },
    };
  }

  async getCategories(userId: string, month: number, year: number) {
    const transactions = await this.repo.findMonthTransactions(
      userId,
      month,
      year,
      { include: { category: true } },
    );

    const incomeMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();
    let incomeTotal = 0;
    let expenseTotal = 0;

    for (const tx of transactions) {
      const catName = tx.category?.name ?? 'Outros';
      const amount = Number(tx.amount);
      if (tx.type === 'Receita') {
        incomeMap.set(catName, (incomeMap.get(catName) || 0) + amount);
        incomeTotal += amount;
      } else {
        expenseMap.set(catName, (expenseMap.get(catName) || 0) + amount);
        expenseTotal += amount;
      }
    }

    const format = (map: Map<string, number>, total: number) =>
      Array.from(map.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);

    return {
      income: format(incomeMap, incomeTotal),
      expense: format(expenseMap, expenseTotal),
    };
  }
}
