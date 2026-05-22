import { formatCurrency } from "@/utils/format-currency";

interface SummaryCardsProps {
  income: string;
  expense: string;
  net: string;
  month: string;
}

export function SummaryCards({ income, expense, net, month }: SummaryCardsProps) {
  const netNum = Number(net);
  const isPositive = netNum >= 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Hero card — net cashflow */}
      <div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: isPositive
            ? "linear-gradient(135deg, #1a4731 0%, #15803d 100%)"
            : "linear-gradient(135deg, #4a1515 0%, #b91c1c 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full opacity-10" style={{ background: "white" }} aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 -left-6 size-32 rounded-full opacity-10" style={{ background: "white" }} aria-hidden />

        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
          Net Cashflow · {month}
        </p>
        <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-white">
          {formatCurrency(net)}
        </p>

        {/* Income & Expense inline */}
        <div className="mt-5 flex gap-4 border-t border-white/10 pt-4">
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">Income</p>
            <p className="text-base font-semibold tabular-nums text-white/90">{formatCurrency(income)}</p>
          </div>
          <div className="w-px bg-white/10" aria-hidden />
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">Expense</p>
            <p className="text-base font-semibold tabular-nums text-white/90">{formatCurrency(expense)}</p>
          </div>
        </div>
      </div>

      {/* Expense ratio bar */}
      {Number(income) > 0 && (
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[var(--color-text-muted)]">Expense ratio</p>
            <p className="text-xs font-semibold tabular-nums" style={{
              color: Number(expense) / Number(income) > 1
                ? "var(--color-danger)"
                : Number(expense) / Number(income) > 0.8
                ? "var(--color-warning)"
                : "var(--color-success)"
            }}>
              {Math.round((Number(expense) / Number(income)) * 100)}%
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--color-border-subtle)]">
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(Math.round((Number(expense) / Number(income)) * 100), 100)}%`,
                backgroundColor: Number(expense) / Number(income) > 1
                  ? "var(--color-danger)"
                  : Number(expense) / Number(income) > 0.8
                  ? "var(--color-warning)"
                  : "var(--color-success)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
