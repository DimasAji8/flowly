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
  targets?: { needsTarget: number; wantsTarget: number; savingsTarget: number };
  savingsTransferAmount?: number;
}

const   DEFAULT_TARGETS = { needsTarget: 50, wantsTarget: 30, savingsTarget: 20 };

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
  under:   { bar: "var(--color-danger)",  text: "var(--color-danger)",  label: "Di bawah target" },
};

function getStatusStyle(status: ReturnType<typeof getStatus>, isMin: boolean) {
  if (status === "over" && isMin) return STATUS_STYLE.under;
  return STATUS_STYLE[status];
}

export function SpendingInsights({ categorySpends, totalIncome, targets, savingsTransferAmount = 0 }: SpendingInsightsProps) {
  if (totalIncome <= 0 || categorySpends.length === 0) return null;

  const t = targets ?? DEFAULT_TARGETS;
  const GROUP_CONFIG = {
    needs:   { label: "Kebutuhan",  desc: "Kebutuhan pokok",       target: t.needsTarget,   targetLabel: `≤${t.needsTarget}% pemasukan` },
    wants:   { label: "Keinginan", desc: "Lifestyle & keinginan",  target: t.wantsTarget,   targetLabel: `≤${t.wantsTarget}% pemasukan` },
    savings: { label: "Tabungan",  desc: "Tabungan & investasi",   target: t.savingsTarget, targetLabel: `≥${t.savingsTarget}% pemasukan`, isMin: true },
  } as const;
  const groupTotals: Record<string, number> = { needs: 0, wants: 0, savings: 0 };
  const ungrouped: CategorySpend[] = [];

  for (const s of categorySpends) {
    if (s.group && s.group in groupTotals) {
      groupTotals[s.group] += s.amount;
    } else {
      ungrouped.push(s);
    }
  }
  // Transfer ke wallet bertipe savings dihitung sebagai tabungan
  groupTotals.savings += savingsTransferAmount;

  const hasGroupData = Object.values(groupTotals).some((v) => v > 0);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-foreground">
        Analisis Pengeluaran
      </h2>

      <div className="rounded-2xl border border-border-subtle bg-card divide-y divide-border-subtle" style={{ boxShadow: "var(--shadow-card-emphasis)" }}>
        {hasGroupData && (() => {
          const entries = (Object.entries(GROUP_CONFIG) as [keyof typeof GROUP_CONFIG, typeof GROUP_CONFIG[keyof typeof GROUP_CONFIG]][]);

          return (
            <>
              {/* Per-group rows */}
              {entries.map(([key, cfg]) => {
                const amount = groupTotals[key] ?? 0;
                const pct = Math.round((amount / totalIncome) * 100);
                const displayPct = amount > 0 && pct === 0 ? "<1" : `${pct}`;
                const isMin = "isMin" in cfg;
                const status = getStatus(pct, cfg.target, isMin);
                const style = getStatusStyle(status, isMin);

                const barPct = isMin
                  ? Math.min((pct / cfg.target) * 100, 100)
                  : Math.min((pct / cfg.target) * 100, 100);

                return (
                  <div key={key} className="flex flex-col gap-2 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: style.bar, boxShadow: `0 0 6px 0 ${style.bar}88` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">{cfg.label}</span>
                          <span className="text-xs text-muted">{cfg.targetLabel}</span>
                        </div>
                        {status !== "safe" && (
                          <p className="text-[11px]" style={{ color: style.text }}>{style.label}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm tabular-nums font-medium" style={{ color: style.text }}>{displayPct}%</span>
                        <span className="text-xs tabular-nums text-muted">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barPct}%`,
                          backgroundColor: style.bar,
                          boxShadow: `0 0 6px 0 ${style.bar}66`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}

        {/* Ungrouped categories */}
        {ungrouped.length > 0 && ungrouped.map((s) => {
          const pct = Math.round((s.amount / totalIncome) * 100);
          return (
            <div key={s.categoryId} className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl text-xl bg-card-subtle">
                {s.categoryIcon}
              </span>
              <span className="flex-1 text-sm text-foreground">{s.categoryName}</span>
              <span className="text-xs tabular-nums text-muted">{pct}%</span>
              <span className="text-xs tabular-nums text-secondary">{formatCurrency(s.amount)}</span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted">
        Berdasarkan pemasukan bulan ini · Kategori tanpa grup tidak dihitung dalam target
      </p>
    </section>
  );
}
