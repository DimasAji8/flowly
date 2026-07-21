"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { FilterBar } from "@/components/ui/filter-bar";
import { ActionMenu } from "@/components/ui/action-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { RecurringModal } from "@/components/recurring/recurring-modal";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import { recurringService } from "@/services/recurring.service";
import type { RecurringTransaction, TransactionType } from "@/types/finance";
import { formatAmount } from "@/utils/format-currency";
import { formatDateMedium } from "@/utils/format-date";
import { useCategoryStore } from "@/store/categories.store";

const FREQ_LABEL: Record<RecurringTransaction["frequency"], string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
};

const TYPE_OPTIONS = [
  { label: "Semua", value: "all" as const },
  { label: "Pemasukan", value: "income" as const },
  { label: "Pengeluaran", value: "expense" as const },
];

const STATUS_OPTIONS = [
  { label: "Semua", value: "all" as const },
  { label: "Aktif", value: "active" as const },
  { label: "Non-aktif", value: "inactive" as const },
];

export default function RecurringListPage() {
  const router = useRouter();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { categories, fetch: fetchCategories } = useCategoryStore();

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await recurringService.list({
          ...(typeFilter !== "all" ? { type: typeFilter } : {}),
          ...(statusFilter !== "all" ? { isActive: statusFilter === "active" } : {}),
        });
        if (!cancelled) {
          setItems(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [typeFilter, statusFilter]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recurringService.list({
        ...(typeFilter !== "all" ? { type: typeFilter } : {}),
        ...(statusFilter !== "all" ? { isActive: statusFilter === "active" } : {}),
      });
      setItems(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  // Refresh data saat transaksi ditambah/diubah/dihapus dari halaman lain
  useEffect(() => {
    const handler = () => { void fetchItems(); };
    window.addEventListener("flowly:transaction-added", handler);
    return () => window.removeEventListener("flowly:transaction-added", handler);
  }, [fetchItems]);

  const toggleActive = async (r: RecurringTransaction) => {
    try {
      await recurringService.update(r.id, { isActive: !r.isActive });
      await fetchItems();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to toggle");
    }
  };

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await recurringService.remove(id);
      setConfirmId(null);
      await fetchItems();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <BackButton />

      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Recurring
        </h1>
        <Button
          size="sm"
          onClick={() => setAddOpen(true)}
          leftIcon={<Plus className="size-4" aria-hidden />}
        >
          Tambah
        </Button>
      </header>

      <FilterBar filters={[
        { key: "type", type: "chip", label: "Tipe", options: TYPE_OPTIONS, value: typeFilter, onChange: setTypeFilter },
        { key: "status", type: "chip", label: "Status", options: STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter },
      ]} />

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-card p-6 text-center text-sm text-muted">
          Memuat…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-secondary">
          Tidak ada recurring transaction yang cocok dengan filter ini.
        </div>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {items.map((r) => {
              const isIncome = r.type === "income";
              const sign = isIncome ? "+" : "−";
              const color = isIncome
                ? "var(--color-success)"
                : "var(--color-danger)";
              const date = r.nextRunAt.slice(0, 10);
              const cat = categories.find((c) => c.id === r.categoryId);
              return (
                <li key={r.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="truncate text-sm font-medium text-foreground max-w-[140px] sm:max-w-none">
                        {r.note?.trim() || cat?.name || `${FREQ_LABEL[r.frequency]} ${r.type}`}
                      </span>
                      <Chip
                        tone={isIncome ? "success" : "danger"}
                        size="sm"
                        className="shrink-0"
                      >
                        {r.type}
                      </Chip>
                      <Chip tone="neutral" size="sm" className="shrink-0">
                        {FREQ_LABEL[r.frequency]}
                      </Chip>
                    </div>
                    <span className="text-xs text-muted mt-0.5 truncate">
                      Berikutnya: {formatDateMedium(date)}
                    </span>
                  </div>

                  <span
                    className="text-sm font-semibold tabular-nums shrink-0"
                    style={{ color }}
                  >
                    {sign} {formatAmount(r.amount)}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleActive(r)}
                    className={["h-6 w-11 shrink-0 rounded-full transition-colors", r.isActive ? "bg-accent" : "bg-border"].join(" ")}
                    aria-pressed={r.isActive}
                    aria-label={r.isActive ? "Jeda" : "Aktifkan"}
                  >
                    <span className={["block size-5 rounded-full bg-white shadow transition-transform", r.isActive ? "translate-x-5" : "translate-x-0.5"].join(" ")} />
                  </button>

                  <ActionMenu
                    onEdit={() => router.push(`${ROUTES.recurring}/edit?id=${r.id}`)}
                    onDelete={() => setConfirmId(r.id)}
                  />
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <RecurringModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchItems}
      />

      <ConfirmModal
        open={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        title="Hapus recurring ini?"
      />
    </div>
  );
}
