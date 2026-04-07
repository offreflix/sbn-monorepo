import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const RECURRENCE_QUEUE = 'recurrence-queue';
export const PROCESS_RECURRENCE_JOB = 'process-recurrence';

export type RecurrenceJobData = {
  recurrenceId: string;
};

@Injectable()
export class RecurrenceQueueService {
  private readonly logger = new Logger(RecurrenceQueueService.name);

  constructor(
    @InjectQueue(RECURRENCE_QUEUE)
    private readonly queue: Queue<RecurrenceJobData>,
  ) {}

  async scheduleNext(
    recurrenceId: string,
    frequency: string,
    startDate: Date,
    timezone: string,
  ): Promise<void> {
    const delay = this.msUntilNextOccurrence(frequency, startDate, timezone);
    const jobId = `recurrence-${recurrenceId}`;

    // Remove existing pending job if any (avoids duplicate when rescheduling)
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      await existing.remove();
    }

    await this.queue.add(
      PROCESS_RECURRENCE_JOB,
      { recurrenceId },
      {
        jobId,
        delay,
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    const runsAt = new Date(Date.now() + delay);
    this.logger.log(
      `Scheduled recurrence ${recurrenceId} (${frequency}) → next run at ${runsAt.toISOString()}`,
    );
  }

  async cancel(recurrenceId: string): Promise<void> {
    const jobId = `recurrence-${recurrenceId}`;
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Cancelled job for recurrence ${recurrenceId}`);
    }
  }

  /**
   * Computes milliseconds until the next occurrence of a recurrence.
   *
   * For MONTHLY: next occurrence is on the same day-of-month as startDate.
   *   If that day doesn't exist in the target month (e.g. day 31 in Feb),
   *   we use the last day of that month instead.
   *
   * For WEEKLY: next occurrence is 7 days from now.
   */
  msUntilNextOccurrence(
    frequency: string,
    startDate: Date,
    timezone: string,
  ): number {
    const now = new Date();

    if (frequency === 'TEST_MINUTELY') {
      // Only for development testing — fires in 1 minute
      return 60_000;
    }

    if (frequency === 'WEEKLY') {
      // Next run is exactly 7 days from now
      return 7 * 24 * 60 * 60 * 1000;
    }

    // MONTHLY: find next occurrence of startDate's day-of-month in user's timezone
    const targetDay = this.getDayOfMonthInTimezone(startDate, timezone);
    const next = this.nextMonthlyOccurrence(targetDay, timezone, now);

    const ms = next.getTime() - now.getTime();
    // Minimum 1 minute to avoid immediate re-queue loops
    return Math.max(ms, 60_000);
  }

  private getDayOfMonthInTimezone(date: Date, timezone: string): number {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      day: 'numeric',
    }).format(date);
    return parseInt(formatted, 10);
  }

  private nextMonthlyOccurrence(
    targetDay: number,
    timezone: string,
    from: Date,
  ): Date {
    // Get current date components in user's timezone
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).formatToParts(from);

    const get = (type: string) =>
      parseInt(parts.find((p) => p.type === type)!.value, 10);

    const currentYear = get('year');
    const currentMonth = get('month'); // 1-based
    const day = get('day');

    // If today is before or on the target day this month, use this month
    // Otherwise, use next month
    let candidateMonth = currentMonth;
    let candidateYear = currentYear;

    if (day >= targetDay) {
      // Move to next month
      candidateMonth = currentMonth + 1;
      if (candidateMonth > 12) {
        candidateMonth = 1;
        candidateYear = currentYear + 1;
      }
    }

    // Clamp day to last day of candidate month (edge case: day 31 in Feb)
    const daysInMonth = new Date(candidateYear, candidateMonth, 0).getDate();
    const actualDay = Math.min(targetDay, daysInMonth);

    // Build midnight of that day in the user's timezone, convert to UTC
    // We use a date string and let JS parse with the timezone offset
    const tzOffset = this.getTimezoneOffsetMinutes(
      timezone,
      candidateYear,
      candidateMonth,
      actualDay,
    );
    const localMidnight = new Date(
      `${candidateYear}-${String(candidateMonth).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}T00:00:00`,
    );
    // Adjust to UTC by adding the offset (offset is UTC - local, so subtract it)
    const utc = new Date(localMidnight.getTime() - tzOffset * 60_000);
    return utc;
  }

  private getTimezoneOffsetMinutes(
    timezone: string,
    year: number,
    month: number,
    day: number,
  ): number {
    // Create a date at midnight UTC and find the offset for the target timezone
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(date);

    const get = (type: string) =>
      parseInt(parts.find((p) => p.type === type)!.value, 10);

    // Hours can be 24 (midnight), normalize to 0
    const localHour = get('hour') % 24;
    const localMinute = get('minute');
    const localDay = get('day');

    // Difference from UTC (UTC is midnight = 0h)
    let diffMinutes = localHour * 60 + localMinute;
    // If local day differs from UTC day, adjust
    if (localDay !== day) {
      diffMinutes = localDay > day ? diffMinutes - 1440 : diffMinutes + 1440;
    }
    // offset = UTC - local → to convert local to UTC: UTC = local - offset → UTC.getTime() = local.getTime() - offset*60000
    return diffMinutes;
  }
}
