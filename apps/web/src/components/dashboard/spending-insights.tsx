"use client";

import type { CategoryGroup } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";

interface CategorySpend {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  group: CategoryGroup | null;
  amount: number;
}

interface SpendingInsightsProps {
  categorySpends: CategorySpend[];
  totalIncome: number;
}

const GROUP_CONFIG = {
  needs:   { label: "Kebutuhan",  desc: "Kebutuhan pokok",       target: 60, targetLabel: "≤60% pemasukan" },
  wants:   { label: "Keinginan", desc: "Lifestyle & keinginan",  target: 30, targetLabel: "≤30% pemasukan" },
  savings: { label: "Tabungan",  desc: "Tabungan & investasi",   target: 20, targetLabel: "≥20% pemasukan", isMin: true },
} as const;

function getStatus(pct: number, target: number, isMin = false) {
  if (isMin) {
    if (pct >= target) return "safe";
    if (pct >= target * 0.5) return "warning";
    return "over";
  }
  if (pct <= target * 0.8) return "safe";
  if (pct <= target) return "warning";
  return "over";
}

const STATUS_STYLE = {
  safe:    { bar: "var(--color-success)", text: "var(--color-success)", label: "Dalam batas" },
  warning: { bar: "var(--color-warning)", text: "var(--color-warning)", label: "Mendekati batas" },
  over:    { bar: "var(--color-danger)",  text: "var(--color-danger)",  label: "Melebihi rekomendasi" },
};

export function SpendingInsights({ categorySpends, totalIncome }: SpendingInsightsProps) {
  if (totalIncome <= 0 || categorySpends.length === 0) return null;

  // Aggregate per group
  const groupTotals: Record<string, number> = { needs: 0, wants: 0, savings: 0 };
  const ungrouped: CategorySpend[] = [];

  for (const s of categorySpends) {
    if (s.group && s.group in groupTotals) {
      groupTotals[s.group] += s.amount;
    } else {
      ungrouped.push(s);
    }
  }

  const hasGroupData = Object.values(groupTotals).some((v) => v > 0);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
        Analisis Pengeluaran
      </h2>

      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] divide-y divide-[var(--color-border-subtle)]" style={{ boxShadow: "var(--shadow-card-emphasis)" }}>
        {/* Group rows */}
        {hasGroupData && (Object.entries(GROUP_CONFIG) as [keyof typeof GROUP_CONFIG, typeof GROUP_CONFIG[keyof typeof GROUP_CONFIG]][]).map(([key, cfg]) => {
          const amount = groupTotals[key] ?? 0;
          const pct = Math.round((amount / totalIncome) * 100);
          const barPct = Math.min(pct, 100);
          const status = getStatus(pct, cfg.target, "isMin" in cfg);
          const style = STATUS_STYLE[status];

          return (
            <div key={key} className="px-4 py-3.5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{cfg.label}</span>
                  <span className="ml-2 text-xs text-[var(--color-text-muted)]">{cfg.targetLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs tabular-nums" style={{ color: style.text }}>{pct}%</span>
                  <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{formatCurrency(amount)}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-[var(--color-border-subtle)]">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${barPct}%`,
                    backgroundColor: style.bar,
                    boxShadow: `0 0 8px 0 ${style.bar}66`,
                  }}
                />
              </div>
              {status !== "safe" && (
                <p className="mt-1 text-[11px]" style={{ color: style.text }}>{style.label}</p>
              )}
            </div>
          );
        })}

        {/* Ungrouped categories */}
        {ungrouped.length > 0 && ungrouped.map((s) => {
          const pct = Math.round((s.amount / totalIncome) * 100);
          return (
            <div key={s.categoryId} className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg text-base" style={{ background: s.categoryColor + "22" }}>
                {s.categoryIcon}
              </span>
              <span className="flex-1 text-sm text-[var(--color-text-primary)]">{s.categoryName}</span>
              <span className="text-xs tabular-nums text-[var(--color-text-muted)]">{pct}%</span>
              <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">{formatCurrency(s.amount)}</span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--color-text-muted)]">
        Berdasarkan pemasukan bulan ini · Kategori tanpa grup tidak dihitung dalam target
      </p>
    </section>
  );
}
