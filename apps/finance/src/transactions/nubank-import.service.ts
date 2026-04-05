import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import { Transaction } from '@prisma/client-finance';
import { TransactionsRepository } from './transactions.repository';
import { WalletsRepository } from '../wallets/wallets.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { TransactionType } from './dto/create-transaction.dto';
import {
  NubankFile,
  NubankFileParser,
  NubankParsedRow,
} from './nubank/nubank-file-parser.interface';
import { CsvNubankParser } from './nubank/csv-nubank-parser';
import { OfxNubankParser } from './nubank/ofx-nubank-parser';
import { PdfNubankParser } from './nubank/pdf-nubank-parser';

@Injectable()
export class NubankImportService {
  private readonly parsers: Record<string, NubankFileParser>;

  constructor(
    private txRepo: TransactionsRepository,
    private walletsRepo: WalletsRepository,
    private catRepo: CategoriesRepository,
    csvParser: CsvNubankParser,
    ofxParser: OfxNubankParser,
    pdfParser: PdfNubankParser,
  ) {
    this.parsers = {
      '.csv': csvParser,
      '.ofx': ofxParser,
      '.pdf': pdfParser,
    };
  }

  async import(params: {
    userId: string;
    walletId: string;
    file: NubankFile;
  }): Promise<Transaction[]> {
    const { userId, walletId, file } = params;

    const wallet = await this.walletsRepo.findByIdAndUser(walletId, userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const ext = path.extname(file.originalname || '').toLowerCase();
    const parser = this.parsers[ext];
    if (!parser) {
      throw new Error('Unsupported Nubank file type');
    }

    const rows = await parser.parse(file);
    const createdTransactions: Transaction[] = [];

    for (const row of rows) {
      const categoryId = await this.resolveCategoryId(
        userId,
        row.type,
        row.description,
      );
      const installmentInfo = this.parseInstallmentInfo(row.description);

      if (installmentInfo) {
        await this.processInstallmentRow(
          userId,
          walletId,
          row,
          categoryId,
          installmentInfo,
          createdTransactions,
        );
      } else {
        await this.processSingleRow(
          userId,
          walletId,
          row,
          categoryId,
          createdTransactions,
        );
      }
    }

    return createdTransactions;
  }

  private async processInstallmentRow(
    userId: string,
    walletId: string,
    row: NubankParsedRow,
    categoryId: string,
    installmentInfo: ReturnType<typeof this.parseInstallmentInfo> & object,
    createdTransactions: Transaction[],
  ): Promise<void> {
    const existingSeries = await this.txRepo.findFirst({
      userId,
      walletId,
      totalInstallments: installmentInfo.totalInstallments,
      amount: row.amount,
      description: {
        contains: installmentInfo.baseDescription,
        mode: 'insensitive',
      },
    });

    if (existingSeries) return;

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

      const existing = await this.txRepo.findFirst({
        userId,
        walletId,
        installmentNumber: i,
        totalInstallments: installmentInfo.totalInstallments,
        description,
      });

      if (existing) continue;

      const created = await this.txRepo.create({
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
      });

      createdTransactions.push(created);
    }
  }

  private async processSingleRow(
    userId: string,
    walletId: string,
    row: NubankParsedRow,
    categoryId: string,
    createdTransactions: Transaction[],
  ): Promise<void> {
    const date = new Date(row.date);
    date.setHours(0, 0, 0, 0);

    const existing = await this.txRepo.findFirst({
      userId,
      walletId,
      date,
      amount: row.amount,
      description: row.description,
    });

    if (existing) return;

    const created = await this.txRepo.create({
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
    });

    createdTransactions.push(created);
  }

  private async resolveCategoryId(
    userId: string,
    type: TransactionType,
    description: string,
  ): Promise<string> {
    const categories = await this.catRepo.findForNubank(userId, type);

    if (!categories.length) {
      const created = await this.catRepo.createDefault(
        userId,
        type === TransactionType.Receita
          ? 'Outras receitas'
          : 'Outras despesas',
        type,
      );
      return created.id;
    }

    const descLower = (description || '').toLowerCase();
    const byName = categories.find((cat) =>
      descLower.includes(cat.name.toLowerCase()),
    );
    if (byName) return byName.id;

    const outros = categories.find((cat) =>
      cat.name.toLowerCase().includes('outro'),
    );
    if (outros) return outros.id;

    return categories[0].id;
  }

  private parseInstallmentInfo(description: string): {
    baseDescription: string;
    installmentNumber: number;
    totalInstallments: number;
  } | null {
    const match = description.match(/^(.*?)-\s*Parcela\s*(\d+)\s*\/\s*(\d+)/i);
    if (!match) return null;

    const baseDescription = match[1].trim();
    const installmentNumber = Number(match[2]);
    const totalInstallments = Number(match[3]);

    if (!installmentNumber || !totalInstallments) return null;

    return { baseDescription, installmentNumber, totalInstallments };
  }
}
