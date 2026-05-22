import { RecurringFrequency } from '@prisma/client';

/**
 * Hitung next_run_at berikutnya berdasarkan frequency.
 * Input & output dalam UTC.
 */
export function computeNextRunAt(
  current: Date,
  frequency: RecurringFrequency,
): Date {
  const next = new Date(current);
  switch (frequency) {
    case RecurringFrequency.daily:
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case RecurringFrequency.weekly:
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case RecurringFrequency.monthly:
      next.setUTCMonth(next.getUTCMonth() + 1);
      break;
  }
  return next;
}
