import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Wallet, Recurrence, Transaction } from '@prisma/client';

@Injectable()
export class ProjectionsService {
  constructor(private prisma: PrismaService) {}

  async getProjection(userId: string, months: number = 6) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // 1. Get Initial Balance (Liquid Assets)
    const wallets = await this.prisma.wallet.findMany({
      where: { user_id: userId, type: { not: 'CREDIT_CARD' } }, // Exclude debts from 'Available Cash'
    });
    let currentBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

    // 2. Fetch Pending/Future Transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { wallet: true },
    });

    // 3. Fetch Recurrences and Simulate
    const recurrences = await this.prisma.recurrence.findMany({
      where: { user_id: userId, active: true },
    });
    const simulatedTransactions = this.simulateRecurrences(
      recurrences,
      startDate,
      endDate,
    );

    // 4. Merge and Process
    const allEvents = [
      ...transactions.map((t) => ({
        date: t.date,
        amount: Number(t.amount),
        type: t.type,
        description: t.description,
        isCreditCard: t.wallet?.type === 'CREDIT_CARD', // Need to check if wallet exists and type
        wallet: t.wallet,
      })),
      ...simulatedTransactions,
    ];

    // Optimize: Map Credit Card transactions to Due Date
    const processedEvents = allEvents.map((event) => {
      if (event.isCreditCard && event.wallet?.invoice_due_day) {
        // Logic to move date to next Due Day
        // Simple MVP: Ensure it's projected on the Due Day of the *next* month if after closing, etc.
        // For now, let's just leave it at transaction date or assume the user sets the date to the pay day.
        // User requirement: "Dia 10: Vence Fatura... Gráfico desce".
        // So we really should map to Due Day.
        const dueDate = this.calculateDueDate(
          event.date,
          event.wallet.invoice_due_day,
          event.wallet.invoice_closing_day,
        );
        return { ...event, date: dueDate };
      }
      return event;
    });

    // Sort by Date
    processedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    // 5. Generate Timeline
    const timeline = [];
    for (const event of processedEvents) {
      if (event.type === 'EXPENSE') {
        currentBalance -= event.amount;
      } else {
        currentBalance += event.amount;
      }
      timeline.push({
        date: event.date.toISOString().split('T')[0],
        balance: currentBalance,
        event: event.description,
        amount: event.amount,
      });
    }

    return timeline;
  }

  private simulateRecurrences(
    recurrences: Recurrence[],
    start: Date,
    end: Date,
  ) {
    const events = [];
    for (const rule of recurrences) {
      let current = new Date(rule.start_date);
      // specific logic to align 'current' > start if needed
      while (current < start) {
        current = this.nextDate(current, rule.frequency);
      }

      while (current <= end) {
        if (!rule.end_date || current <= rule.end_date) {
          events.push({
            date: new Date(current),
            amount: Number(rule.amount),
            type: rule.type,
            description: `${rule.description} (Recorrente)`,
            isCreditCard: false, // Assume recurrences are usually bills/incomes directly on account, or if CC, handled by wallet logic?
            wallet: null, // TODO: Fetch wallet if needed for CC logic
          });
        }
        current = this.nextDate(current, rule.frequency);
      }
    }
    return events;
  }

  private nextDate(date: Date, frequency: string) {
    const next = new Date(date);
    if (frequency === 'MONTHLY') {
      next.setMonth(next.getMonth() + 1);
    } else if (frequency === 'WEEKLY') {
      next.setDate(next.getDate() + 7);
    }
    return next;
  }

  private calculateDueDate(
    transactionDate: Date,
    dueDay: number,
    closingDay: number | null,
  ) {
    // Basic Logic: If date <= closingDay, Due in Same Month (if due > closing) or Next Month?
    // Usually:
    // Closing 20th. Due 5th (next month).
    // Purchase 10th Jan -> Closes 20th Jan -> Due 5th Feb.
    // Purchase 21st Jan -> Closes 20th Feb -> Due 5th Mar.

    if (!closingDay) return transactionDate;

    const closing = new Date(transactionDate);
    closing.setDate(closingDay);

    const due = new Date(transactionDate);
    due.setDate(dueDay);

    if (transactionDate.getDate() <= closingDay) {
      // Included in current month's closing.
      // Due date is usually next month relative to closing??
      // Let's assume Due Day is always in the month AFTER the closing.
      due.setMonth(due.getMonth() + 1);
    } else {
      // Next invoice
      due.setMonth(due.getMonth() + 2);
    }
    return due;
  }
}
