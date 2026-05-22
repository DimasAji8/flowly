import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringService } from '../modules/recurring/recurring.service';

/**
 * Scheduler untuk menjalankan recurring transactions yang sudah due.
 *
 * Strategi:
 *   - Jalan setiap jam (top of hour) — kompromi antara presisi & beban DB.
 *     Kalau perlu lebih responsif, ganti ke EVERY_5_MINUTES.
 *   - Hanya 1 instance NestJS yang boleh jalan scheduler ini di production
 *     (kalau ada multi-instance, gunakan distributed lock atau pisahkan
 *     jadi worker dedicated).
 */
@Injectable()
export class RecurringJob {
  private readonly logger = new Logger(RecurringJob.name);

  constructor(private readonly recurringService: RecurringService) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'recurring-due',
  })
  async handleHourly() {
    try {
      await this.recurringService.runDueJobs();
    } catch (e) {
      this.logger.error(
        `recurring-due tick failed: ${(e as Error).message}`,
        e instanceof Error ? e.stack : undefined,
      );
    }
  }
}
