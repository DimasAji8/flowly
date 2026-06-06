import { formatAmount } from "@/utils/format-currency";

interface MonthlySummaryCardProps {
  income: number;
  expense: number;
  net: number;
}

export function MonthlySummaryCard({ income, expense, net }: MonthlySummaryCardProps) {
  return (
    <div
      className="rounded-2xl border border-border-subtle bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="mb-4 text-sm font-semibold text-foreground">Ringkasan Bulan Ini</h2>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Pemasukan</span>
          <span className="text-sm font-semibold text-success">
            + {formatAmount(income)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Pengeluaran</span>
          <span className="text-sm font-semibold text-danger">
            − {formatAmount(expense)}
          </span>
        </div>

        <div className="h-px bg-border-subtle" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Sisa</span>
          <span
            className="text-base font-bold tabular-nums"
            style={{ color: net >= 0 ? "var(--color-success)" : "var(--color-danger)" }}
          >
            {net >= 0 ? "+" : "−"} {formatAmount(Math.abs(net))}
          </span>
        </div>
      </div>
    </div>
  );
}
