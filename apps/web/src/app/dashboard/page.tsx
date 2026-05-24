"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SpendingInsights } from "@/components/dashboard/spending-insights";
import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionModal } from "@/components/transaction/transaction-modal";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import { transactionsService } from "@/services/transactions.service";
import { useAuthStore } from "@/store/auth.store";
import type { MonthlySummary, Transaction, CategoryGroup } from "@/types/finance";
import { formatMonthYear } from "@/utils/format-date";

type CategorySpend = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  group: CategoryGroup | null;
  amount: number;
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const { resolvedTheme } = useTheme();

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [allTx, setAllTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat pagi";
    if (h < 15) return "Selamat siang";
    if (h < 18) return "Selamat sore";
    return "Selamat malam";
  });

  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => { void refreshMe(); }, [refreshMe]);

  useEffect(() => {
    let cancelled = false;
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
        if (cancelled) return;
        setSummary(s);
        setRecent(all.data
          .slice()
          .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
          .slice(0, 5)
        );
        setAllTx(all.data);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Gagal memuat dashboard");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [reloadKey]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("flowly:transaction-added", handler);
    return () => window.removeEventListener("flowly:transaction-added", handler);
  }, [load]);

  const categorySpends = useMemo<CategorySpend[]>(() => {
    const map = new Map<string, CategorySpend>();
    for (const tx of allTx) {
      if (tx.type !== "expense") continue;
      const existing = map.get(tx.categoryId);
      if (existing) {
        existing.amount += Number(tx.amount);
      } else {
        map.set(tx.categoryId, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          categoryIcon: tx.category.icon,
          categoryColor: tx.category.color,
          group: (tx.category as { group?: CategoryGroup }).group ?? null,
          amount: Number(tx.amount),
        });
      }
    }
    return Array.from(map.values());
  }, [allTx]);

  const totalIncome = Number(summary?.income ?? 0);
  const avatarSrc = user?.gender === "m" ? "/svg/m.svg" : user?.gender === "f" ? "/svg/f.svg" : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between" suppressHydrationWarning>
        {/* Logo: hanya tampil di mobile */}
        <Image src={resolvedTheme === "dark" ? "/img/logo-dark.webp" : "/img/logo-light.webp"} alt="Flowly" width={48} height={48} className="h-12 w-auto md:hidden" />
        {/* Desktop: greeting */}
        <p className="hidden md:block text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }} suppressHydrationWarning>
          {greeting}, {user?.name?.split(" ")[0] ?? "..."}
        </p>
        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-semibold text-foreground md:hidden" suppressHydrationWarning>
            {user?.name ?? "..."}
          </h1>
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt={user?.name ?? "avatar"} width={36} height={36} className="size-9 rounded-full object-cover shrink-0 md:hidden" />
          ) : (
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent select-none md:hidden">
              {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
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

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Transaksi terbaru
            </h2>
            {!loading && (
              <div className="flex items-center gap-3">
                <Link href={ROUTES.transactions} className="text-xs text-muted hover:underline">
                  Lihat semua
                </Link>
              </div>
            )}
          </div>
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border-subtle bg-card px-2 py-2" style={{ boxShadow: "var(--shadow-card-emphasis)" }}>
              <TransactionList
                items={recent}
                loading={false}
                onItemClick={(tx) => setEditTx(tx)}
              />
            </div>
          )}
        </section>

        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        ) : categorySpends.length > 0 && (
          <SpendingInsights
            categorySpends={categorySpends}
            totalIncome={totalIncome}
          />
        )}
      </div>

      <TransactionModal
        open={addOpen || Boolean(editTx)}
        onClose={() => { setAddOpen(false); setEditTx(null); }}
        onSuccess={load}
        transaction={editTx ?? undefined}
      />
    </div>
  );
}
