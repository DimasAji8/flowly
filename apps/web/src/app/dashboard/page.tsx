"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Coins, ChevronDown } from "lucide-react";
import { SavingsGoalsSummary } from "@/components/dashboard/savings-goals-summary";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionModal } from "@/components/transaction/transaction-modal";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import { savingsGoalsService } from "@/services/savings-goals.service";
import { transactionsService } from "@/services/transactions.service";
import { budgetsService, type BudgetSummaryItem } from "@/services/budgets.service";
import { useAuthStore } from "@/store/auth.store";
import { useWalletStore } from "@/store/wallets.store";
import type { MonthlySummary, Transaction, SavingsGoal } from "@/types/finance";
import { formatMonthYear } from "@/utils/format-date";
import { formatAmount } from "@/utils/format-currency";
import { useTour } from "@/hooks/use-tour";
import { getDashboardSteps } from "@/components/tour/tours/dashboard-tour";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const router = useRouter();

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const { startTour, navigateToNextPage } = useTour({
    tourId: "dashboard",
    steps: getDashboardSteps({
      isDesktop,
      onNavigateToWallets: () => {
        navigateToNextPage("wallets", ROUTES.wallets, router.push);
      },
    }),
  });

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [overBudgets, setOverBudgets] = useState<BudgetSummaryItem[]>([]);
  const [nearBudgets, setNearBudgets] = useState<BudgetSummaryItem[]>([]);
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const { wallets, fetch: fetchWallets } = useWalletStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [greeting, setGreeting] = useState("Selamat datang");

  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => { void refreshMe(); }, [refreshMe]);

  useEffect(() => {
    const h = new Date().getHours();
    // setState di effect disengaja: salam bergantung jam klien (hindari hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (h < 11) setGreeting("Selamat pagi");
    else if (h < 15) setGreeting("Selamat siang");
    else if (h < 18) setGreeting("Selamat sore");
    else setGreeting("Selamat malam");
  }, []);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const period = `${year}-${String(month).padStart(2, "0")}`;

    Promise.all([
      transactionsService.monthlySummary(),
      transactionsService.list({ limit: 5, page: 1, from, to }),
      savingsGoalsService.list(),
      fetchWallets(),
      budgetsService.getSummary(period).catch(() => []),
    ])
      .then(([s, all, goals, _, budgetSummary]) => {
        if (cancelled) return;
        setSummary(s);
        setRecent(all.data
          .slice()
          .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
          .slice(0, 3)
        );
        setSavingsGoals(goals);
        const over = budgetSummary.filter((b: BudgetSummaryItem) => b.limit !== null && b.spent > b.limit);
        const near = budgetSummary.filter((b: BudgetSummaryItem) => b.limit !== null && b.spent >= b.limit * 0.8 && b.spent <= b.limit);
        setOverBudgets(over);
        setNearBudgets(near);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Gagal memuat dashboard");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  useEffect(() => {
    const handler = () => {
      // Invalidate wallet store agar data saldo ter-update
      useWalletStore.getState().invalidate();
      load();
    };
    window.addEventListener("flowly:transaction-added", handler);
    return () => window.removeEventListener("flowly:transaction-added", handler);
  }, [load]);

  useEffect(() => {
    if (!loading && summary) {
      const timer = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, summary, startTour]);

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
  const avatarSrc = user?.gender === "m" ? "/svg/m.svg" : user?.gender === "f" ? "/svg/f.svg" : null;

  return (
    <div className="flex flex-col gap-8 flowly-enter">
      <DashboardHeader greeting={greeting} name={user?.name ?? ""} avatarSrc={avatarSrc} />

      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {/* SummaryCards overlap ke header */}
      <div className="-mt-16">
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
            totalBalance={totalBalance}
          />
        )}
      </div>



      <QuickActions />

      {/* Collapsible Budget Alerts */}
      {!loading && (overBudgets.length > 0 || nearBudgets.length > 0) && (
        <div className="rounded-2xl border border-border-subtle bg-card shadow-sm overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setAlertsExpanded(!alertsExpanded)}
            className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-card-subtle/50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={[
                  "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                  overBudgets.length > 0 ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning",
                ].join(" ")}
              >
                <Coins className="size-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-secondary">
                  Notifikasi Anggaran
                </span>
                <span className="text-xs md:text-sm font-semibold text-foreground truncate mt-0.5">
                  {overBudgets.length > 0 && nearBudgets.length > 0
                    ? `${overBudgets.length} kategori overbudget & ${nearBudgets.length} hampir habis`
                    : overBudgets.length > 0
                    ? `${overBudgets.length} kategori overbudget`
                    : `${nearBudgets.length} kategori hampir habis`}
                </span>
              </div>
            </div>
            <ChevronDown
              className={[
                "size-5 text-muted transition-transform duration-300",
                alertsExpanded ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          <div
            className={[
              "transition-all duration-300 ease-in-out border-t border-border-subtle/50 bg-card-subtle/20",
              alertsExpanded ? "max-h-[500px] opacity-100 p-4" : "max-h-0 opacity-0 overflow-hidden",
            ].join(" ")}
          >
            <ul className="flex flex-col gap-2">
              {overBudgets.map((b) => (
                <li key={b.categoryId} className="flex items-start gap-2 text-xs md:text-sm text-secondary leading-relaxed">
                  <span className="size-1.5 rounded-full shrink-0 bg-danger mt-1.5" />
                  <span>
                    Kategori <span className="font-semibold text-foreground">{b.categoryName}</span> melebihi anggaran sebesar <span className="font-bold text-danger">Rp {formatAmount(b.spent - b.limit!)}</span>.
                  </span>
                </li>
              ))}
              {nearBudgets.map((b) => (
                <li key={b.categoryId} className="flex items-start gap-2 text-xs md:text-sm text-secondary leading-relaxed">
                  <span className="size-1.5 rounded-full shrink-0 bg-warning mt-1.5" />
                  <span>
                    Kategori <span className="font-semibold text-foreground">{b.categoryName}</span> hampir habis, sisa <span className="font-bold text-warning">Rp {formatAmount(b.limit! - b.spent)}</span>.
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border-subtle bg-card px-2 py-2" style={{ boxShadow: "var(--shadow-card-emphasis)" }}>
              <TransactionList
                items={recent}
                loading={false}
                onItemClick={(tx) => setEditTx(tx)}
                onAdd={() => setAddOpen(true)}
              />
            </div>
          )}
        </section>

        {!loading && savingsGoals.length > 0 && (
          <SavingsGoalsSummary items={savingsGoals} />
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
