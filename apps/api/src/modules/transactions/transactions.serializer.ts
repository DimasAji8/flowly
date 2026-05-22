import { Transaction } from '@prisma/client';

export interface SerializedTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: string;
  categoryId: string;
  walletId: string;
  userId: string;
  note: string | null;
  transactionDate: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

function toDateOnly(d: Date): string {
  // simpan UTC date sebagai YYYY-MM-DD (kolom @db.Date sudah UTC midnight)
  return d.toISOString().slice(0, 10);
}

export function serializeTransaction(tx: Transaction): SerializedTransaction {
  return {
    id: tx.id,
    type: tx.type,
    amount: tx.amount.toString(),
    categoryId: tx.categoryId,
    walletId: tx.walletId,
    userId: tx.userId,
    note: tx.note,
    transactionDate: toDateOnly(tx.transactionDate),
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  };
}

export interface SerializedTransactionWithRefs extends SerializedTransaction {
  category: { id: string; name: string; color: string; icon: string; group: string | null };
  wallet: { id: string; name: string };
}

export function serializeTransactionWithRefs(
  tx: Transaction & {
    category: { id: string; name: string; color: string; icon: string; group: string | null };
    wallet: { id: string; name: string };
  },
): SerializedTransactionWithRefs {
  return {
    ...serializeTransaction(tx),
    category: tx.category,
    wallet: tx.wallet,
  };
}
