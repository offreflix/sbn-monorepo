import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string, month: number, year: number) {
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);
    endDate.setHours(23, 59, 59, 999);

    // 1. Wallets Balance (Cash) - excludes credit cards
    // Types can be: "Conta Corrente", "Poupança", "Cartão de Crédito", "Investimento", "Dinheiro", "Outro"
    const allWallets = await this.prisma.wallet.findMany({
      where: { userId, deletedAt: null },
    });

    // Credit card types (case-insensitive check)
    const isCreditCard = (type: string) =>
      type.toLowerCase().includes('crédito') ||
      type.toLowerCase().includes('credito') ||
      type.toLowerCase() === 'credit_card' ||
      type.toLowerCase() === 'credit card';

    const wallets = allWallets.filter((w) => !isCreditCard(w.type));
    const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

    // 2. Credit Card Invoices
    const creditCards = allWallets.filter((w) => isCreditCard(w.type));

    let currentInvoice = 0;
    let nextInvoice = 0;
    let totalInvoices = 0;

    // Fetch all unpaid CC transactions (or future ones)
    // Simplified: Fetch all expenses on CC wallets
    const ccTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        walletId: { in: creditCards.map((c) => c.id) },
        type: 'Despesa',
        status: { not: 'Pago' }, // Assuming paid invoices mark transactions as paid? Or using specific logic?
        // Usually, paying an invoice creates a transfer or balance adjustment, but individual transactions might remain 'Pendente' until reconciled.
        // For 'Fatura Atual', we usually sum up transactions that fall into the current billing cycle.
      },
    });

    for (const tx of ccTransactions) {
      totalInvoices += Number(tx.amount);

      // Determine if it belongs to Current or Next invoice
      // This requires knowing the Closing Day.
      // If we don't have wallet info easily mapped, we find it.
      const wallet = creditCards.find((c) => c.id === tx.walletId);
      if (wallet && wallet.invoiceClosingDay) {
        const txDate = new Date(tx.date);
        const closingDateCurrent = new Date(
          currentYear,
          currentMonth - 1,
          wallet.invoiceClosingDay,
        );
        const closingDatePrevious = new Date(
          currentYear,
          currentMonth - 2,
          wallet.invoiceClosingDay,
        );

        // Current Invoice: Transactions between Previous Closing + 1 Day AND Current Closing
        // This is a rough approximation.
        if (txDate > closingDatePrevious && txDate <= closingDateCurrent) {
          currentInvoice += Number(tx.amount);
        } else if (txDate > closingDateCurrent) {
          nextInvoice += Number(tx.amount);
        }
      } else {
        // Fallback: Use Calendar Month
        const txDate = new Date(tx.date);
        if (txDate >= startDate && txDate <= endDate) {
          currentInvoice += Number(tx.amount);
        } else if (txDate > endDate) {
          nextInvoice += Number(tx.amount);
        }
      }
    }

    // 3. Overview (Income vs Expense vs Balance for the specific month)
    const monthTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const income = monthTransactions
      .filter((t) => t.type === 'Receita')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'Despesa')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const periodBalance = income - expense;

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
        balance: periodBalance,
      },
    };
  }

  async getYearOverview(userId: string, year: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        date: true,
        amount: true,
        type: true,
      },
    });

    // Month aggregates + per-day aggregates (only days with transactions)
    const months = Array.from({ length: 12 }, () => ({
      income: 0,
      expense: 0,
      balance: 0,
      days: new Map<number, { income: number; expense: number }>(),
    }));

    for (const tx of transactions) {
      const m = new Date(tx.date).getMonth(); // 0-11
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
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const incomeMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();
    const incomeTotal = { value: 0 };
    const expenseTotal = { value: 0 };

    transactions.forEach((tx) => {
      const catName = tx.category?.name || 'Outros';
      const amount = Number(tx.amount);
      if (tx.type === 'Receita') {
        incomeMap.set(catName, (incomeMap.get(catName) || 0) + amount);
        incomeTotal.value += amount;
      } else {
        expenseMap.set(catName, (expenseMap.get(catName) || 0) + amount);
        expenseTotal.value += amount;
      }
    });

    const format = (map: Map<string, number>, total: number) => {
      return Array.from(map.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);
    };

    return {
      income: format(incomeMap, incomeTotal.value),
      expense: format(expenseMap, expenseTotal.value),
    };
  }
}
