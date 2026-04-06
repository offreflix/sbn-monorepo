import { Module } from '@nestjs/common';
import { FinanceApiService } from './finance-api.service';

@Module({
  providers: [FinanceApiService],
  exports: [FinanceApiService],
})
export class FinanceApiModule {}
