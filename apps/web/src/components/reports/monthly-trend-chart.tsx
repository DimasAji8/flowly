import { formatAmount } from "@/utils/format-currency";

interface MonthData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface MonthlyTrendChartProps {
  data: MonthData[];
}

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Oct", "Nov", "Des"];

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return null;
  }

  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense]));
  const scale = maxValue > 0 ? 100 / maxValue : 1;

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="mb-4 text-sm font-semibold text-foreground">Tren 6 Bulan Terakhir</h2>

      <div className="space-y-4">
        {data.map((item) => {
          const [year, month] = item.month.split("-");
          const monthName = MONTH_NAMES_SHORT[parseInt(month, 10) - 1];
          const incomeWidth = item.income * scale;
          const expenseWidth = item.expense * scale;

          return (
            <div key={item.month} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{monthName} {year}</span>
                <span
                  className="font-semibold tabular-nums"
                  style={{ color: item.net >= 0 ? "var(--color-success)" : "var(--color-danger)" }}
                >
                  {item.net >= 0 ? "+" : "−"} {formatAmount(Math.abs(item.net))}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-success">Masuk</span>
                  <div className="flex-1 h-5 bg-border-subtle rounded-md overflow-hidden">
                    <div
                      className="h-full bg-success transition-all"
                      style={{ width: `${incomeWidth}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-[10px] text-muted tabular-nums">
                    {formatAmount(item.income)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-danger">Keluar</span>
                  <div className="flex-1 h-5 bg-border-subtle rounded-md overflow-hidden">
                    <div
                      className="h-full bg-danger transition-all"
                      style={{ width: `${expenseWidth}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-[10px] text-muted tabular-nums">
                    {formatAmount(item.expense)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
