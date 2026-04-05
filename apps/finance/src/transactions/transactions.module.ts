import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { WalletsRepository } from '../wallets/wallets.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { BalanceService } from './balance.service';
import { InstallmentService } from './installment.service';
import { NubankImportService } from './nubank-import.service';
import { CsvNubankParser } from './nubank/csv-nubank-parser';
import { OfxNubankParser } from './nubank/ofx-nubank-parser';
import { PdfNubankParser } from './nubank/pdf-nubank-parser';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionsRepository,
    WalletsRepository,
    CategoriesRepository,
    BalanceService,
    InstallmentService,
    NubankImportService,
    CsvNubankParser,
    OfxNubankParser,
    PdfNubankParser,
  ],
})
export class TransactionsModule {}
