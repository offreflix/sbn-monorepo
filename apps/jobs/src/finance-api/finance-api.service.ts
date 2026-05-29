import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FinanceApiService {
  private readonly logger = new Logger(FinanceApiService.name);
  private readonly financeUrl: string;
  private readonly internalKey: string;

  constructor(private config: ConfigService) {
    this.financeUrl = config.get<string>(
      'FINANCE_SERVICE_URL',
      'http://localhost:56082',
    );
    const internalKey =
      config.get<string>('INTERNAL_SERVICE_KEY') ??
      (process.env.NODE_ENV === 'production' ? undefined : 'internal-secret');
    if (!internalKey) {
      throw new Error('INTERNAL_SERVICE_KEY is required in production');
    }
    this.internalKey = internalKey;
  }

  async triggerRecurrence(recurrenceId: string): Promise<void> {
    const url = `${this.financeUrl}/recurrences/${recurrenceId}/trigger`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-internal-key': this.internalKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `Finance API returned ${response.status} for recurrence ${recurrenceId}: ${body}`,
      );
    }

    this.logger.log(`Triggered transaction for recurrence ${recurrenceId}`);
  }
}
