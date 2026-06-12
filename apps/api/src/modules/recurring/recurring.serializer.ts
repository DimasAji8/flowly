import { RecurringTransaction } from '@prisma/client';

export interface SerializedRecurring {
  id: string;
  type: 'income' | 'expense';
  amount: string;
  categoryId: string;
  walletId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  note: string | null;
  nextRunAt: string;
  isActive: boolean;
  createdAt: Date;
}

export function serializeRecurring(
  r: RecurringTransaction,
): SerializedRecurring {
  return {
    id: r.id,
    type: r.type,
    amount: r.amount.toString(),
    categoryId: r.categoryId,
    walletId: r.walletId,
    frequency: r.frequency,
    note: r.note,
    nextRunAt: r.nextRunAt.toISOString(),
    isActive: r.isActive,
    createdAt: r.createdAt,
  };
}
