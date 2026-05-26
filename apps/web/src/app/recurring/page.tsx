"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ActionMenu } from "@/components/ui/action-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import { recurringService } from "@/services/recurring.service";
import type { RecurringTransaction } from "@/types/finance";
import { formatAmount } from "@/utils/format-currency";

const FREQ_LABEL: Record<RecurringTransaction["frequency"], string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
};

export default function RecurringListPage() {
  const router = useRouter();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recurringService.list();
      setItems(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleActive = async (r: RecurringTransaction) => {
    try {
      await recurringService.update(r.id, { isActive: !r.isActive });
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to toggle");
    }
  };

  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await recurringService.remove(id);
      setConfirmId(null);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Recurring
        </h1>
        <Button
          size="sm"
          asChildHref={`${ROUTES.recurring}/new`}
          leftIcon={<Plus className="size-4" aria-hidden />}
        >
          Tambah
        </Button>
      </header>

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
          Belum ada recurring transaction.
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
              return (
                <li key={r.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {r.note?.trim() || `${FREQ_LABEL[r.frequency]} ${r.type}`}
                      </span>
                      <Chip
                        tone={isIncome ? "success" : "danger"}
                        size="sm"
                      >
                        {r.type}
                      </Chip>
                      <Chip tone="neutral" size="sm">
                        {FREQ_LABEL[r.frequency]}
                      </Chip>
                    </div>
                    <span className="text-xs text-muted">
                      Jadwal berikutnya: {date}
                    </span>
                  </div>

                  <span
                    className="text-sm font-semibold tabular-nums"
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
                    onEdit={() => router.push(`${ROUTES.recurring}/${r.id}/edit`)}
                    onDelete={() => setConfirmId(r.id)}
                  />
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <ConfirmModal
        open={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        title="Hapus recurring ini?"
      />
    </div>
  );
}
