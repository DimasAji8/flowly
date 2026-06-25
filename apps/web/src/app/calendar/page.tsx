"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthCalendar, type DayData } from "@/components/calendar/month-calendar";
import { TransactionList } from "@/components/transaction/transaction-list";
import { ApiError } from "@/lib/api-client";
import { transactionsService } from "@/services/transactions.service";
import type { DailySummary, Transaction } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateLong, isoToday } from "@/utils/format-date";
import { useTour } from "@/hooks/use-tour";
import { calendarSteps } from "@/components/tour/tours/calendar-tour";

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(isoToday());

  const { startTour } = useTour({
    tourId: "calendar",
    steps: calendarSteps,
  });

  const [daily, setDaily] = useState<DailySummary | null>(null);
  const [dayItems, setDayItems] = useState<Transaction[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingDay, setLoadingDay] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!loadingMonth && daily) {
      const timer = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loadingMonth, daily, startTour]);

  useEffect(() => {
    let cancelled = false;
    transactionsService
      .dailySummary(year, month)
      .then((d) => { if (!cancelled) setDaily(d); })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Gagal memuat data");
      })
      .finally(() => { if (!cancelled) setLoadingMonth(false); });
    return () => { cancelled = true; };
  }, [year, month, reloadKey]);

  useEffect(() => {
    let cancelled = false;
    transactionsService
      .list({ from: selectedDate, to: selectedDate, limit: 100, page: 1 })
      .then((r) => { if (!cancelled) setDayItems(r.data); })
      .catch(() => { if (!cancelled) setDayItems([]); })
      .finally(() => { if (!cancelled) setLoadingDay(false); });
    return () => { cancelled = true; };
  }, [selectedDate, reloadKey]);

  // Refresh data saat transaksi ditambah/diubah/dihapus dari halaman lain
  useEffect(() => {
    const handler = () => setReloadKey((k) => k + 1);
    window.addEventListener("flowly:transaction-added", handler);
    return () => window.removeEventListener("flowly:transaction-added", handler);
  }, []);

  const dataMap = useMemo(() => {
    const m = new Map<string, DayData>();
    daily?.days.forEach((d) => {
      m.set(d.date, { income: Number(d.income), expense: Number(d.expense) });
    });
    return m;
  }, [daily]);

  const monthlySummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    daily?.days.forEach((d) => {
      income += Number(d.income);
      expense += Number(d.expense);
    });
    return { income, expense };
  }, [daily]);

  const selectedSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of dayItems) {
      const amt = Number(t.amount);
      if (t.type === "income") income += amt;
      else expense += amt;
    }
    return { income, expense };
  }, [dayItems]);

  const handlePrev = () => {
    setLoadingMonth(true);
    setError(null);
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const handleNext = () => {
    setLoadingMonth(true);
    setError(null);
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };
  const handleToday = () => {
    setLoadingMonth(true);
    setLoadingDay(true);
    setError(null);
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDate(isoToday());
  };
  const handleSelectDate = (date: string) => {
    setLoadingDay(true);
    setSelectedDate(date);
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        Kalender
      </h1>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      <Card padding="md" className="calendar-card-container">
        {loadingMonth && !daily ? (
          <div className="flex flex-col gap-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3.5 w-40" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
            {/* Grid skeleton */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 rounded" />
              ))}
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <MonthCalendar
            year={year}
            month={month}
            data={dataMap}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            monthlySummary={monthlySummary}
          />
        )}
      </Card>

      {/* Monthly summary */}
      {!loadingMonth && (
        <div className="calendar-monthly-summary flex items-center justify-between rounded-xl bg-card px-4 py-3 border border-border-subtle">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-muted uppercase tracking-wide">Pemasukan</span>
            <span className="text-sm font-semibold tabular-nums text-success">
              +{formatCurrency(monthlySummary.income, { compact: true })}
            </span>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-muted uppercase tracking-wide">Pengeluaran</span>
            <span className="text-sm font-semibold tabular-nums text-danger">
              −{formatCurrency(monthlySummary.expense, { compact: true })}
            </span>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-muted uppercase tracking-wide">Selisih</span>
            <span className={`text-sm font-semibold tabular-nums ${monthlySummary.income - monthlySummary.expense >= 0 ? "text-foreground" : "text-danger"}`}>
              {formatCurrency(monthlySummary.income - monthlySummary.expense, { compact: true })}
            </span>
          </div>
        </div>
      )}

      {/* Selected day detail */}
      <section className="calendar-daily-detail flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground">
            {formatDateLong(selectedDate)}
          </h2>
          {(selectedSummary.income > 0 || selectedSummary.expense > 0) && (
            <div className="flex items-center gap-3 text-xs tabular-nums">
              {selectedSummary.income > 0 && (
                <span className="text-success">
                  +{formatCurrency(selectedSummary.income, { compact: true })}
                </span>
              )}
              {selectedSummary.expense > 0 && (
                <span className="text-danger">
                  −{formatCurrency(selectedSummary.expense, { compact: true })}
                </span>
              )}
            </div>
          )}
        </div>

        {loadingDay ? (
          <Card padding="md">
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-xl shrink-0" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card padding="md">
            <TransactionList items={dayItems} />
          </Card>
        )}
      </section>
    </div>
  );
}
