import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FinanceApiService } from '../finance-api/finance-api.service';

export const RECURRENCE_QUEUE = 'recurrence-queue';

type RecurrenceJobData = { recurrenceId: string };

@Processor(RECURRENCE_QUEUE)
export class RecurrenceProcessor extends WorkerHost {
  private readonly logger = new Logger(RecurrenceProcessor.name);

  constructor(private readonly financeApi: FinanceApiService) {
    super();
  }

  async process(job: Job<RecurrenceJobData>): Promise<void> {
    const { recurrenceId } = job.data;
    this.logger.log(
      `Processing job ${job.id} → recurrence ${recurrenceId} (attempt ${job.attemptsMade + 1})`,
    );

    await this.financeApi.triggerRecurrence(recurrenceId);

    this.logger.log(`Done: recurrence ${recurrenceId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<RecurrenceJobData>, error: Error) {
    this.logger.error(
      `Job ${job.id} for recurrence ${job.data.recurrenceId} failed after ${job.attemptsMade} attempts: ${error.message}`,
      error.stack,
    );
  }
}
