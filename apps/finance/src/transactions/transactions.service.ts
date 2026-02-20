import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTransactionDto,
  TransactionType,
} from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Prisma } from '@prisma/client-finance';
import * as path from 'path';

declare const require: any;

type NubankParsedRow = {
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
};

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateTransactionDto) {
    const installments =
      data.installments && data.installments > 1 ? data.installments : 1;
    const purchaseGroupId = installments > 1 ? crypto.randomUUID() : null;
    const installmentAmount =
      installments > 1 ? data.amount / installments : data.amount;

    const wallet = await this.prisma.wallet.findFirst({
      where: { id: data.walletId, userId: userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Handle Recurrence Creation
    let newRecurrenceId = data.recurrenceId;
    if (data.recurrenceId) {
      // recurrenceId passed, just use it
    }
    // Note: The logic for creating a new recurrence from transaction data seems implicit in the original code
    // but the DTO doesn't have 'isRecurring' or 'frequency' fields.
    // Assuming for now we stick to the DTO properties.
    // If 'isRecurring' was passed in 'any', it needs to be in DTO or handled separately.
    // Looking at DTO: no 'isRecurring'. I will strictly follow DTO.
    // If logic is missing in DTO, it's a bug in DTO or service design, but I must adhere to strict typing.
    // However, I must not break existing logic if possible.
    // The original code accessed 'isRecurring' from 'data'.
    // If 'CreateTransactionDto' does NOT have 'isRecurring', then the previous code was reading undefined or property exists at runtime.
    // I previously read 'CreateTransactionDto' and it did NOT have 'isRecurring'.
    // I will add 'isRecurring' and 'frequency' to the DTO in a separate step if strictly needed,
    // but for now I will assume they might be missing or I should fix DTO.
    // Actually, to avoid breaking logic, I should likely update the DTO or these fields are not currently used/tested?
    // Let's assume for this refactor I only include fields present in DTO.
    // ... wait, if I remove logic that relied on 'any', I break features.
    // I will verify DTO again. It did NOT have isRecurring. Use of 'any' hid this.
    // I'll stick to DTO and if fields are missing, I'll update DTO in next step.
    // For this step, I will comment out recurrence creation logic that relies on non-existent DTO fields
    // or better, I will assume the DTO *should* have them and cast `data as any` locally ONLY for those fields to safely migrate
    // while noting the DTO deficiency, OR better: I will update DTO first? No, sequential tools.
    // I'll just rely on `data` as typed by DTO. If DTO is missing fields, typescript will complain.
    // To make it compile, I will temporarily cast to `any` for the missing fields inside the method to match behavior,
    // but the method signature will be strict.
    // Actually, looking at the previous file content, `isRecurring` WAS used.
    // I will cast `data` to `any` specifically for those missing fields to preserve logic until DTO is updated.

    const safeData = data as any; // Temporary to preserve behavior for fields missing in DTO

    if (safeData.isRecurring) {
      const recurrence = await this.prisma.recurrence.create({
        data: {
          userId: userId,
          walletId: data.walletId,
          categoryId: data.categoryId,
          amount: data.amount, // Recurrence is usually the full value per period, not split
          type: data.type,
          description: data.description,
          frequency: safeData.frequency || 'MONTHLY', // Default to Monthly
          startDate: new Date(data.date),
          active: true,
        },
      });
      newRecurrenceId = recurrence.id;
    }

    if (installments > 1) {
      const transactions = [];
      const baseDate = new Date(data.date);

      for (let i = 0; i < installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        const isInstallmentPaid = i === 0 && data.isPaid;
        const status = isInstallmentPaid ? 'Pago' : 'Pendente';

        transactions.push(
          this.prisma.transaction.create({
            data: {
              userId: userId,
              walletId: data.walletId,
              categoryId: data.categoryId,
              amount: installmentAmount,
              date: date,
              description: data.description
                ? `${data.description} (${i + 1}/${installments})`
                : `Parcela ${i + 1}/${installments}`,
              tags: [] as string[],
              status: status,
              type: data.type,
              isPaid: isInstallmentPaid,
              installmentNumber: i + 1,
              totalInstallments: data.installments,
              purchaseGroupId: purchaseGroupId,
              recurrenceId: newRecurrenceId,
            },
          }),
        );
      }

      const createdTransactions = await this.prisma.$transaction(transactions);

      if (data.isPaid) {
        const firstTx = createdTransactions[0];
        const increment =
          firstTx.type === 'Receita'
            ? Number(firstTx.amount)
            : -Number(firstTx.amount);
        await this.prisma.wallet.update({
          where: { id: firstTx.walletId },
          data: { balance: { increment: increment } },
        });
      }
      return createdTransactions;
    }

    let isPaid = data.isPaid || false;
    let status = data.status || (isPaid ? 'Pago' : 'Pendente');

    if (status === 'Pago') isPaid = true;
    if (isPaid && status !== 'Pago') status = 'Pago';

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: userId,
        walletId: data.walletId,
        categoryId: data.categoryId,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description,
        tags: [] as string[],
        status: status,
        type: data.type,
        isPaid: isPaid,
        installmentNumber: data.installmentNumber,
        totalInstallments: data.totalInstallments,
        recurrenceId: newRecurrenceId,
      },
    });

    if (transaction.isPaid) {
      const increment =
        transaction.type === 'Receita'
          ? Number(transaction.amount) // Ensure conversion if needed, though type is number already
          : -Number(transaction.amount);
      await this.prisma.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: increment,
          },
        },
      });
    }

    return transaction;
  }

  async findAll(userId: string, month?: number, year?: number) {
    const where: Prisma.TransactionWhereInput = { userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        wallet: true,
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    // Only return if belongs to user
    return this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        wallet: true,
        category: true,
      },
    });
  }

  async update(id: string, userId: string, data: UpdateTransactionDto) {
    // Ensure the transaction belongs to the user
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found or denied access');
    }

    const updateData: Prisma.TransactionUpdateInput = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    // Logic to sync isPaid and status
    if (data.isPaid !== undefined) {
      updateData.isPaid = data.isPaid;
      // Auto-update status based on isPaid
      if (updateData.isPaid) {
        updateData.status = 'Pago';
      } else {
        if (!data.status || data.status === 'Pago') {
          updateData.status = 'Pendente';
        }
      }
    } else if (data.status === 'Pago') {
      updateData.isPaid = true;
    } else if (data.status === 'Pendente') {
      updateData.isPaid = false;
    }

    // Remove immutable fields or sensitive ones if necessary
    // userId and id are not in UpdateTransactionDto usually, but good to be safe if they leak in
    // @ts-ignore
    delete updateData.userId;
    // @ts-ignore
    delete updateData.id;

    // Revert previous balance effect if it was paid
    if (transaction.isPaid) {
      const revertIncrement =
        transaction.type === 'Receita'
          ? -Number(transaction.amount)
          : Number(transaction.amount);
      await this.prisma.wallet.update({
        where: { id: transaction.walletId },
        data: { balance: { increment: revertIncrement } },
      });
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    // Apply new balance effect if paid
    if (updatedTransaction.isPaid) {
      const applyIncrement =
        updatedTransaction.type === 'Receita'
          ? Number(updatedTransaction.amount)
          : -Number(updatedTransaction.amount);
      await this.prisma.wallet.update({
        where: { id: updatedTransaction.walletId },
        data: { balance: { increment: applyIncrement } },
      });
    }

    return updatedTransaction;
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found or denied access');
    }

    if (transaction.isPaid) {
      const increment =
        transaction.type === 'Receita'
          ? -Number(transaction.amount)
          : Number(transaction.amount);
      await this.prisma.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: increment,
          },
        },
      });
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async getSummary(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get Total Balance from Wallets
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
    });
    const totalBalance = wallets.reduce(
      (acc, wallet) => acc + Number(wallet.balance),
      0,
    );

    // Get Income and Expenses for the period
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'Receita')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'Despesa')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
    };
  }

  async importNubank(params: {
    userId: string;
    walletId: string;
    file: any;
  }) {
    const { userId, walletId, file } = params;

    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const ext = path.extname(file.originalname || '').toLowerCase();
    let rows: NubankParsedRow[] = [];

    if (ext === '.csv') {
      rows = this.parseNubankCsv(file.buffer.toString('utf8'));
    } else if (ext === '.ofx') {
      rows = this.parseNubankOfx(file.buffer.toString('utf8'));
    } else if (ext === '.pdf') {
      rows = await this.parseNubankPdf(file.buffer);
    } else {
      throw new Error('Unsupported Nubank file type');
    }

    const createdTransactions = [];

    for (const row of rows) {
      const categoryId = await this.resolveCategoryIdForNubank(
        userId,
        row.type,
        row.description,
      );
      const installmentInfo = this.parseInstallmentInfo(row.description);

      if (installmentInfo) {
        const existingSeries = await this.prisma.transaction.findFirst({
          where: {
            userId,
            walletId,
            totalInstallments: installmentInfo.totalInstallments,
            amount: row.amount,
            description: {
              contains: installmentInfo.baseDescription,
              mode: 'insensitive',
            },
          },
        });

        if (existingSeries) {
          continue;
        }

        const firstDate = new Date(row.date);
        firstDate.setHours(0, 0, 0, 0);
        firstDate.setMonth(
          firstDate.getMonth() - (installmentInfo.installmentNumber - 1),
        );

        const purchaseGroupId = crypto.randomUUID();

        for (let i = 1; i <= installmentInfo.totalInstallments; i++) {
          const installmentDate = new Date(firstDate);
          installmentDate.setMonth(firstDate.getMonth() + (i - 1));

          const description = `${installmentInfo.baseDescription} - Parcela ${i}/${installmentInfo.totalInstallments}`;

          const existingInstallment = await this.prisma.transaction.findFirst({
            where: {
              userId,
              walletId,
              installmentNumber: i,
              totalInstallments: installmentInfo.totalInstallments,
              description,
            },
          });

          if (existingInstallment) {
            continue;
          }

          const created = await this.prisma.transaction.create({
            data: {
              userId,
              walletId,
              categoryId,
              amount: row.amount,
              date: installmentDate,
              description,
              tags: [] as string[],
              status: 'Pendente',
              type: row.type,
              isPaid: false,
              installmentNumber: i,
              totalInstallments: installmentInfo.totalInstallments,
              purchaseGroupId,
            },
          });

          createdTransactions.push(created);
        }
      } else {
        const date = new Date(row.date);
        date.setHours(0, 0, 0, 0);

        const existing = await this.prisma.transaction.findFirst({
          where: {
            userId,
            walletId,
            date,
            amount: row.amount,
            description: row.description,
          },
        });

        if (existing) {
          continue;
        }

        const created = await this.prisma.transaction.create({
          data: {
            userId,
            walletId,
            categoryId,
            amount: row.amount,
            date,
            description: row.description,
            tags: [] as string[],
            status: 'Pendente',
            type: row.type,
            isPaid: false,
          },
        });

        createdTransactions.push(created);
      }
    }

    return createdTransactions;
  }

  private async resolveCategoryIdForNubank(
    userId: string,
    type: TransactionType,
    description: string,
  ): Promise<string> {
    const categories = await this.prisma.category.findMany({
      where: {
        deletedAt: null,
        type,
        OR: [
          { userId },
          { userId: null, isDefault: true },
        ],
      },
    });

    if (!categories.length) {
      const created = await this.prisma.category.create({
        data: {
          userId,
          name: type === TransactionType.Receita ? 'Outras receitas' : 'Outras despesas',
          type,
          isDefault: false,
        },
      });
      return created.id;
    }

    const descLower = (description || '').toLowerCase();
    const byName = categories.find((cat) =>
      descLower.includes(cat.name.toLowerCase()),
    );
    if (byName) {
      return byName.id;
    }

    const outros = categories.find((cat) =>
      cat.name.toLowerCase().includes('outro'),
    );
    if (outros) {
      return outros.id;
    }

    return categories[0].id;
  }

  private parseNubankCsv(content: string): NubankParsedRow[] {
    const lines = content.split(/\r?\n/).map((line) => line.trim());
    const rows: NubankParsedRow[] = [];

    for (const line of lines) {
      if (!line || line.startsWith('date,')) {
        continue;
      }

      const match = line.match(/^([^,]+),(.*),([^,]+)$/);
      if (!match) {
        continue;
      }

      const dateStr = match[1].trim();
      let title = match[2].trim();
      const amountStr = match[3].trim();

      if (title.startsWith('"') && title.endsWith('"')) {
        title = title.slice(1, -1).replace(/""/g, '"');
      }

      const rawAmount = parseFloat(amountStr.replace(',', '.'));
      if (Number.isNaN(rawAmount)) {
        continue;
      }

      const type: TransactionType =
        rawAmount < 0 ? TransactionType.Receita : TransactionType.Despesa;
      const amount = Math.abs(rawAmount);

      const date = new Date(dateStr);

      rows.push({
        date,
        description: title,
        amount,
        type,
      });
    }

    return rows;
  }

  private parseNubankOfx(content: string): NubankParsedRow[] {
    const rows: NubankParsedRow[] = [];
    const parts = content.split('<STMTTRN>').slice(1);

    for (const part of parts) {
      const block = part.split('</STMTTRN>')[0];

      const trnTypeMatch = block.match(/<TRNTYPE>([^<]+)/);
      const dtPostedMatch = block.match(/<DTPOSTED>([^<]+)/);
      const trnAmtMatch = block.match(/<TRNAMT>([^<]+)/);
      const memoMatch = block.match(/<MEMO>([^<]+)/);

      if (!trnTypeMatch || !dtPostedMatch || !trnAmtMatch || !memoMatch) {
        continue;
      }

      const trnType = trnTypeMatch[1].trim();
      const dtPosted = dtPostedMatch[1].trim();
      const trnAmtStr = trnAmtMatch[1].trim();
      const memo = memoMatch[1].trim();

      const rawAmount = parseFloat(trnAmtStr.replace(',', '.'));
      if (Number.isNaN(rawAmount)) {
        continue;
      }

      const type: TransactionType =
        trnType.toUpperCase() === 'CREDIT'
          ? TransactionType.Receita
          : TransactionType.Despesa;
      const amount = Math.abs(rawAmount);

      const year = Number(dtPosted.slice(0, 4));
      const month = Number(dtPosted.slice(4, 6)) - 1;
      const day = Number(dtPosted.slice(6, 8));

      const date = new Date(year, month, day);

      rows.push({
        date,
        description: memo,
        amount,
        type,
      });
    }

    return rows;
  }

  private async parseNubankPdf(buffer: Buffer): Promise<NubankParsedRow[]> {
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    const text: string = result.text || '';

    const lines = text.split(/\r?\n/).map((line: string) => line.trim());
    const rows: NubankParsedRow[] = [];

    for (const line of lines) {
      const match = line.match(
        /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\d{1,3}(\.\d{3})*,\d{2})/,
      );

      if (!match) {
        continue;
      }

      const dateStr = match[1];
      const description = match[2].trim();
      const amountRawStr = match[3].replace(/\./g, '').replace(',', '.').trim();

      const rawAmount = parseFloat(amountRawStr);
      if (Number.isNaN(rawAmount)) {
        continue;
      }

      const type: TransactionType =
        rawAmount < 0 ? TransactionType.Receita : TransactionType.Despesa;
      const amount = Math.abs(rawAmount);

      const [dayStr, monthStr, yearStr] = dateStr.split('/');
      const day = Number(dayStr);
      const month = Number(monthStr) - 1;
      const year = Number(yearStr);

      const date = new Date(year, month, day);

      rows.push({
        date,
        description,
        amount,
        type,
      });
    }

    return rows;
  }

  private parseInstallmentInfo(description: string): {
    baseDescription: string;
    installmentNumber: number;
    totalInstallments: number;
  } | null {
    const match = description.match(/^(.*?)-\s*Parcela\s*(\d+)\s*\/\s*(\d+)/i);

    if (!match) {
      return null;
    }

    const baseDescription = match[1].trim();
    const installmentNumber = Number(match[2]);
    const totalInstallments = Number(match[3]);

    if (!installmentNumber || !totalInstallments) {
      return null;
    }

    return {
      baseDescription,
      installmentNumber,
      totalInstallments,
    };
  }
}
