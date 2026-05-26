import Link from "next/link";
import { useState } from "react";
import type { Transaction } from "@/types/finance";
import { formatAmount } from "@/utils/format-currency";
import { formatDateLong, formatRelativeDate } from "@/utils/format-date";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";

interface TransactionListProps {
  items: Transaction[];
  loading?: boolean;
  grouped?: boolean;
  onItemClick?: (tx: Transaction) => void;
}

function TransactionItem({ tx, onItemClick, showDate = false }: {
  tx: Transaction;
  onItemClick?: (tx: Transaction) => void;
  showDate?: boolean;
}) {
  const isIncome = tx.type === "income";
  const sign = isIncome ? "+" : "−";
  const amountColor = isIncome ? "var(--color-success)" : "var(--color-danger)";
  const iconBg = tx.category.color + "22";

  const content = (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-card-subtle active:scale-[0.99]"
      style={{ cursor: onItemClick ? "pointer" : undefined }}
    >
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-lg text-base"
        style={{ background: iconBg }}
      >
        {tx.category.icon ?? tx.category.name.slice(0, 2).toUpperCase()}
      </span>

      <div className="flex flex-1 flex-col min-w-0">
        <span className="truncate text-sm font-medium text-foreground">
          {tx.note?.trim() || tx.category.name}
        </span>
        <span className="text-xs text-muted">
          {tx.note?.trim() ? `${tx.category.name} · ` : ""}
          {showDate ? `${formatRelativeDate(tx.transactionDate)} · ` : ""}
          {tx.wallet.name}
        </span>
      </div>

      <span className="shrink-0 text-xs md:text-sm font-semibold tabular-nums" style={{ color: amountColor }}>
        {sign} Rp {formatAmount(tx.amount)}
      </span>
    </div>
  );

  return onItemClick ? (
    <button type="button" className="w-full text-left" onClick={() => onItemClick(tx)}>
      {content}
    </button>
  ) : (
    <Link href={`/transactions/${tx.id}/edit`}>{content}</Link>
  );
}

function groupByDate(items: Transaction[]): { date: string; transactions: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const tx of items) {
    const key = tx.transactionDate.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, transactions]) => ({ date, transactions }));
}

function dateLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yestStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  if (dateStr === todayStr) return "Hari ini";
  if (dateStr === yestStr) return "Kemarin";
  return formatDateLong(dateStr);
}

export function TransactionList({ items, loading, grouped = false, onItemClick }: TransactionListProps) {
  const [visibleGroups, setVisibleGroups] = useState(3);
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
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
        actionLabel="+ Tambah transaksi"
        actionHref={ROUTES.transactionsNew}
      />
    );
  }

  if (!grouped) {
    return (
      <ul className="flex flex-col">
        {items.map((tx, idx) => (
          <li key={tx.id} className={idx !== items.length - 1 ? "border-b border-border-subtle" : ""}>
            <TransactionItem tx={tx} onItemClick={onItemClick} showDate />
          </li>
        ))}
      </ul>
    );
  }

  const groups = groupByDate(items);
  const visible = groups.slice(0, visibleGroups);
  const hasMore = groups.length > visibleGroups;

  return (
    <div className="flex flex-col gap-4">
      {visible.map(({ date, transactions }) => {
        const dayIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
        const dayExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

        return (
          <div key={date}>
            {/* Group header */}
            <div className="flex items-center justify-between px-3 pb-1.5">
              <span className="text-xs font-semibold text-secondary">
                {dateLabel(date)}
              </span>
              {(() => {
                const net = dayIncome - dayExpense;
                const color = net >= 0 ? "var(--color-success)" : "var(--color-danger)";
                return (
                  <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>
                    {net >= 0 ? "+" : "−"}Rp {formatAmount(Math.abs(net))}
                  </span>
                );
              })()}
            </div>
            {/* Items */}
            <div className="rounded-2xl border border-border-subtle bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
              <ul className="flex flex-col">
                {transactions.map((tx, idx) => (
                  <li key={tx.id} className={idx !== transactions.length - 1 ? "border-b border-border-subtle" : ""}>
                    <TransactionItem tx={tx} onItemClick={onItemClick} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleGroups((v) => v + 3)}
          className="w-full py-2 text-xs text-muted hover:text-secondary transition-colors"
        >
          Tampilkan lebih banyak
        </button>
      )}
    </div>
  );
}
