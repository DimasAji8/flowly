"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SpendingInsights } from "@/components/dashboard/spending-insights";
import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionModal } from "@/components/transaction/transaction-modal";
import { DeleteTransactionModal } from "@/components/transaction/delete-transaction-modal";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import { transactionsService } from "@/services/transactions.service";
import { useAuthStore } from "@/store/auth.store";
import type { MonthlySummary, Transaction } from "@/types/finance";
import { formatMonthYear } from "@/utils/format-date";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.refreshMe);

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [allTx, setAllTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  useEffect(() => { void refreshMe(); }, [refreshMe]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    Promise.all([
      transactionsService.monthlySummary(),
      transactionsService.list({ limit: 500, page: 1, from, to }),
    ])
      .then(([s, all]) => {
        setSummary(s);
        setRecent(all.data.slice(0, 5));
        setAllTx(all.data);
      })
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? e.message : "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Reload saat FAB di bottom nav menambah transaksi
  useEffect(() => {
    const handler = () => load();
    window.addEventListener("flowly:transaction-added", handler);
    return () => window.removeEventListener("flowly:transaction-added", handler);
  }, [load]);

  // Aggregate expense per category untuk insights
  const categorySpends = useMemo(() => {
    const map = new Map<string, { amount: number; name: string; icon: string; color: string; group: Transaction["category"] extends { group?: infer G } ? G : never }>();
    for (const tx of allTx) {
      if (tx.type !== "expense") continue;
      const existing = map.get(tx.categoryId);
      if (existing) {
        existing.amount += Number(tx.amount);
      } else {
        map.set(tx.categoryId, {
          amount: Number(tx.amount),
          name: tx.category.name,
          icon: tx.category.icon,
          color: tx.category.color,
          group: (tx.category as any).group ?? null,
        });
      }
    }
    return Array.from(map.entries()).map(([id, v]) => ({
      categoryId: id,
      categoryName: v.name,
      categoryIcon: v.icon,
      categoryColor: v.color,
      group: v.group,
      amount: v.amount,
    }));
  }, [allTx]);

  const totalIncome = Number(summary?.income ?? 0);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <header className="flex flex-col gap-0.5">
        <p className="text-sm text-[var(--color-text-muted)]">
          Halo, <span className="font-medium text-[var(--color-text-secondary)]">{user?.name ?? "..."}</span> 👋
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Ringkasan Keuangan
        </h1>
      </header>

      {error && (
        <div className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Skeleton className="col-span-2 h-28 md:col-span-1 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : summary && (
        <SummaryCards
          income={summary.income}
          expense={summary.expense}
          net={summary.net}
          month={formatMonthYear(summary.period.year, summary.period.month)}
        />
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                Recent transactions
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAddOpen(true)}
                  className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  + Add
                </button>
                <Link href={ROUTES.transactions} className="text-xs text-[var(--color-text-muted)] hover:underline">
                  See all
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] px-2 py-2">
              <TransactionList
                items={recent}
                loading={loading}
                onItemClick={(tx) => setEditTx(tx)}
              />
            </div>
          </section>

          {!loading && categorySpends.length > 0 && (
            <SpendingInsights
              categorySpends={categorySpends}
              totalIncome={totalIncome}
            />
          )}
        </div>

        <aside className="hidden md:flex md:flex-col md:gap-3">
          <h2 className="text-sm font-medium text-[var(--color-text-primary)]">Quick actions</h2>
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] p-4 flex flex-col gap-2">
            <Button onClick={() => setAddOpen(true)} className="w-full">
              + Add transaction
            </Button>
            <Button asChildHref={ROUTES.transactions} variant="secondary" className="w-full">
              View all transactions
            </Button>
            <Button asChildHref={ROUTES.wallets} variant="ghost" className="w-full">
              Manage wallets
            </Button>
          </div>
        </aside>
      </div>

      <TransactionModal
        open={addOpen || Boolean(editTx)}
        onClose={() => { setAddOpen(false); setEditTx(null); }}
        onSuccess={load}
        transaction={editTx ?? undefined}
      />

      {deleteTxId && (
        <DeleteTransactionModal
          open={Boolean(deleteTxId)}
          onClose={() => setDeleteTxId(null)}
          onSuccess={load}
          transactionId={deleteTxId}
        />
      )}
    </div>
  );
}
