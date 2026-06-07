import { formatAmount } from "@/utils/format-currency";
import type { CategoryGroup } from "@/types/finance";

type CategorySpend = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  group: CategoryGroup | null;
  amount: number;
};

interface CategorySpendingTableProps {
  categorySpends: CategorySpend[];
  totalExpense: number;
}

export function CategorySpendingTable({ categorySpends, totalExpense }: CategorySpendingTableProps) {
  const sorted = [...categorySpends].sort((a, b) => b.amount - a.amount);

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-card overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="px-5 py-4 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-foreground">Pengeluaran per Kategori</h2>
      </div>

      <div className="divide-y divide-border-subtle">
        {sorted.map((cat) => {
          const percentage = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
          
          return (
            <div key={cat.categoryId} className="px-5 py-3 flex items-center gap-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl bg-card-subtle"
              >
                {cat.categoryIcon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{cat.categoryName}</div>
                <div className="text-xs text-muted">{percentage.toFixed(1)}% dari total</div>
              </div>

              <div className="text-sm font-semibold text-danger tabular-nums">
                {formatAmount(cat.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
