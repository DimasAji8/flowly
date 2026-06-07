"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { SavingsGoal } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateLong } from "@/utils/format-date";

interface SavingsGoalsSummaryProps {
  items: SavingsGoal[];
}

export function SavingsGoalsSummary({ items }: SavingsGoalsSummaryProps) {
  if (items.length === 0) return null;

  const visible = items
    .filter((goal) => {
      // Filter: hanya tampilkan yang tidak di-pause dan belum tercapai
      if (goal.isPaused) return false;
      const targetAmount = Number(goal.targetAmount);
      const currentAmount = Number(goal.currentAmount);
      const isCompleted = currentAmount >= targetAmount && targetAmount > 0;
      return !isCompleted;
    })
    .slice()
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 3);

  if (visible.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Target Tabungan</h2>
        <Link href={ROUTES.savingsGoals} className="text-xs text-muted hover:underline">
          Lihat semua
        </Link>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-card divide-y divide-border-subtle" style={{ boxShadow: "var(--shadow-card-emphasis)" }}>
        {visible.map((goal) => {
          const targetAmount = Number(goal.targetAmount);
          const currentAmount = Number(goal.currentAmount);
          const progress = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;

          return (
            <Link key={goal.id} href={ROUTES.savingsGoals} className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-card-subtle">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <Target className="size-4" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{goal.name}</p>
                    <p className="text-xs text-muted">Target {formatDateLong(goal.targetDate.slice(0, 10))}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-xs text-muted">
                    <span>{progress}%</span>
                    <ArrowRight className="size-3.5" aria-hidden />
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{formatCurrency(currentAmount)}</span>
                  <span>{formatCurrency(targetAmount)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}