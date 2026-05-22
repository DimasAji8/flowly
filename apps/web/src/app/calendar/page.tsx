"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { MonthCalendar, type DayData } from "@/components/calendar/month-calendar";
import { TransactionList } from "@/components/transaction/transaction-list";
import { ApiError } from "@/lib/api-client";
import { transactionsService } from "@/services/transactions.service";
import type { DailySummary, Transaction } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateLong, isoToday } from "@/utils/format-date";

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1..12
  const [selectedDate, setSelectedDate] = useState<string>(isoToday());

  const [daily, setDaily] = useState<DailySummary | null>(null);
  const [dayItems, setDayItems] = useState<Transaction[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingDay, setLoadingDay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load monthly summary
  useEffect(() => {
    let cancelled = false;
    setLoadingMonth(true);
    setError(null);
    transactionsService
      .dailySummary(year, month)
      .then((d) => {
        if (!cancelled) setDaily(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMonth(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  // Load transactions for selected date
  useEffect(() => {
    let cancelled = false;
    setLoadingDay(true);
    transactionsService
      .list({ from: selectedDate, to: selectedDate, limit: 100, page: 1 })
      .then((r) => {
        if (!cancelled) setDayItems(r.data);
      })
      .catch(() => {
        if (!cancelled) setDayItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingDay(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const dataMap = useMemo(() => {
    const m = new Map<string, DayData>();
    daily?.days.forEach((d) => {
      m.set(d.date, {
        income: Number(d.income),
        expense: Number(d.expense),
      });
    });
    return m;
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
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const handleNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-2xl">
        Calendar
      </h1>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-3 py-2.5 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <Card padding="md">
        {loadingMonth && !daily ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            Loading…
          </div>
        ) : (
          <MonthCalendar
            year={year}
            month={month}
            data={dataMap}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
            {formatDateLong(selectedDate)}
          </h2>
          <div className="flex items-center gap-3 text-xs tabular-nums">
            <span className="text-[var(--color-success)]">
              + {formatCurrency(selectedSummary.income)}
            </span>
            <span className="text-[var(--color-danger)]">
              − {formatCurrency(selectedSummary.expense)}
            </span>
          </div>
        </div>

        {loadingDay ? (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] p-6 text-center text-sm text-[var(--color-text-muted)]">
            Loading…
          </div>
        ) : (
          <Card padding="md">
            <TransactionList items={dayItems} />
          </Card>
        )}
      </section>
    </div>
  );
}
