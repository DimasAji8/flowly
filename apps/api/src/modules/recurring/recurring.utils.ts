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

/**
 * Konversi tanggal input (YYYY-MM-DD atau ISO string) ke Date dengan target jam 05:00 WIB (Asia/Jakarta).
 * Jika input hanya YYYY-MM-DD (mis. "2026-08-01"), diset ke "2026-08-01T05:00:00+07:00".
 */
export function parseNextRunAt(input: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(`${input}T05:00:00+07:00`);
  }
  return new Date(input);
}
