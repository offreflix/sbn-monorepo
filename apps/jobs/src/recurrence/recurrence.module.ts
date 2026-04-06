import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RecurrenceProcessor, RECURRENCE_QUEUE } from './recurrence.processor';
import { FinanceApiModule } from '../finance-api/finance-api.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: RECURRENCE_QUEUE }),
    FinanceApiModule,
  ],
  providers: [RecurrenceProcessor],
})
export class RecurrenceModule {}
