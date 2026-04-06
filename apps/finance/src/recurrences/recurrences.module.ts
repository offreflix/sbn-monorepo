import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RecurrencesService } from './recurrences.service';
import { RecurrencesController } from './recurrences.controller';
import { RecurrenceQueueService } from './recurrence-queue.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionsRepository } from '../transactions/transactions.repository';
import { WalletsRepository } from '../wallets/wallets.repository';
import { BalanceService } from '../transactions/balance.service';
import { RECURRENCE_QUEUE } from './recurrence-queue.service';

@Module({
  imports: [PrismaModule, BullModule.registerQueue({ name: RECURRENCE_QUEUE })],
  providers: [
    RecurrencesService,
    RecurrenceQueueService,
    TransactionsRepository,
    WalletsRepository,
    BalanceService,
  ],
  controllers: [RecurrencesController],
})
export class RecurrencesModule {}
