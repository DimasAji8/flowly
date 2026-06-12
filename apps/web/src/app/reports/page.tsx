"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SpendingInsights } from "@/components/dashboard/spending-insights";
import { MonthlySummaryCard } from "@/components/reports/monthly-summary-card";
import { CategorySpendingTable } from "@/components/reports/category-spending-table";
import { ApiError } from "@/lib/api-client";
import { transactionsService } from "@/services/transactions.service";
import { transfersService } from "@/services/transfers.service";
import { walletsService } from "@/services/wallets.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import type { CategoryGroup, Transfer, Wallet } from "@/types/finance";

type CategorySpend = {
  categoryId: string; categoryName: string; categoryIcon: string;
  categoryColor: string; group: CategoryGroup | null; amount: number;
};

const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function ReportsPage() {
  const now = new Date();
  const { targets, fetch: fetchTargets } = useWorkspaceStore();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [categorySpends, setCategorySpends] = useState<CategorySpend[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // setState di effect disengaja: set status loading sebelum fetch data per-bulan.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    Promise.all([
      transactionsService.list({ limit: 500, page: 1, from, to }),
      transactionsService.monthlySummary(year, month),
      fetchTargets(),
      walletsService.list(),
      transfersService.list(year, month),
    ])
      .then(([all, summary, , ws, tf]) => {
        if (cancelled) return;
        const spends = new Map<string, CategorySpend>();
        for (const tx of all.data) {
          if (tx.type !== "expense") continue;
          const e = spends.get(tx.categoryId);
          if (e) { e.amount += Number(tx.amount); }
          else {
            spends.set(tx.categoryId, {
              categoryId: tx.categoryId,
              categoryName: tx.category.name,
              categoryIcon: tx.category.icon,
              categoryColor: tx.category.color,
              group: (tx.category as { group?: CategoryGroup }).group ?? null,
              amount: Number(tx.amount),
            });
          }
        }
        setCategorySpends(Array.from(spends.values()));
        setTotalIncome(Number(summary.income));
        setTotalExpense(Number(summary.expense));
        setNetAmount(Number(summary.net));
        setWallets(ws);
        setTransfers(tf);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Gagal memuat laporan");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const savingsWalletIds = useMemo(
    () => new Set(wallets.filter((w) => w.type === "savings").map((w) => w.id)),
    [wallets],
  );
  const savingsTransferAmount = useMemo(
    () => transfers.filter((t) => savingsWalletIds.has(t.toWalletId)).reduce((s, t) => s + Number(t.amount), 0),
    [transfers, savingsWalletIds],
  );

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="flex flex-col gap-5 max-w-2xl flowly-enter">
      <BackButton />
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">Laporan</h1>
      </header>

      <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-card px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
        <button type="button" onClick={() => { if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1); }} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-card-subtle hover:text-foreground transition-colors">
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{MONTH_NAMES[month - 1]} {year}</p>
          {!isCurrentMonth && (
            <button type="button" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); }} className="text-[11px] text-accent hover:underline">
              Kembali ke bulan ini
            </button>
          )}
        </div>
        <button type="button" onClick={() => { if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1); }} disabled={isCurrentMonth} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-card-subtle hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight className="size-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">{error}</div>
      )}

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : categorySpends.length === 0 || totalIncome === 0 ? (
        <EmptyState
          title="Belum ada data pengeluaran"
          description="Catat transaksi pengeluaran dengan kategori bergrup untuk melihat analisis."
        />
      ) : (
        <>
          <MonthlySummaryCard
            income={totalIncome}
            expense={totalExpense}
            net={netAmount}
          />
          <CategorySpendingTable
            categorySpends={categorySpends}
            totalExpense={totalExpense}
          />
          <SpendingInsights
            categorySpends={categorySpends}
            totalIncome={totalIncome}
            targets={targets ?? undefined}
            savingsTransferAmount={savingsTransferAmount}
          />
        </>
      )}
    </div>
  );
}
