import Link from "next/link";
import type { Transaction } from "@/types/finance";
import { formatAmount } from "@/utils/format-currency";
import { formatDateShort } from "@/utils/format-date";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";

interface TransactionListProps {
  items: Transaction[];
  loading?: boolean;
  onItemClick?: (tx: Transaction) => void;
}

export function TransactionList({ items, loading, onItemClick }: TransactionListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Belum ada transaksi"
        description="Catat pemasukan atau pengeluaran pertamamu"
        actionLabel="+ Add transaction"
        actionHref={ROUTES.transactionsNew}
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {items.map((tx, idx) => {
        const isIncome = tx.type === "income";
        const sign = isIncome ? "+" : "−";
        const amountColor = isIncome ? "var(--color-success)" : "var(--color-danger)";

        // Icon circle: warna kategori dengan opacity rendah sebagai bg
        const iconBg = tx.category.color + "22"; // hex + alpha

        const content = (
          <div
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--color-card-subtle)] active:scale-[0.99]"
            style={{ cursor: onItemClick ? "pointer" : undefined }}
          >
            {/* Category icon circle */}
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-xl text-lg"
              style={{ background: iconBg }}
            >
              {tx.category.icon ?? tx.category.name.slice(0, 2).toUpperCase()}
            </span>

            <div className="flex flex-1 flex-col min-w-0">
              <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {tx.category.name}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {formatDateShort(tx.transactionDate)} · {tx.wallet.name}
                {tx.note ? ` · ${tx.note}` : ""}
              </span>
            </div>

            <span
              className="shrink-0 text-sm font-semibold tabular-nums"
              style={{ color: amountColor }}
            >
              {sign} {formatAmount(tx.amount)}
            </span>
          </div>
        );

        return (
          <li
            key={tx.id}
            className={idx !== items.length - 1 ? "border-b border-[var(--color-border-subtle)]" : ""}
          >
            {onItemClick ? (
              <button type="button" className="w-full text-left" onClick={() => onItemClick(tx)}>
                {content}
              </button>
            ) : (
              <Link href={`/transactions/${tx.id}/edit`}>{content}</Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
