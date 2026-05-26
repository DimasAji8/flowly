"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Card } from "@/components/ui/card";
import { ActionMenu } from "@/components/ui/action-menu";
import { ApiError } from "@/lib/api-client";
import { transfersService } from "@/services/transfers.service";
import type { Transfer } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";
import { formatRelativeDate } from "@/utils/format-date";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function TransferHistoryPage() {
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setMounted(true);
  }, []);

  const [items, setItems] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!mounted || !year || !month) return;
    setLoading(true);
    setError(null);
    transfersService.list(year, month)
      .then(setItems)
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [year, month, mounted]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await transfersService.remove(id);
      toast.success("Transfer dibatalkan");
      setConfirmId(null);
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal membatalkan transfer");
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };
  const isCurrentMonth = mounted && year === new Date().getFullYear() && month === new Date().getMonth() + 1;
  const goToCurrentMonth = () => { const d = new Date(); setYear(d.getFullYear()); setMonth(d.getMonth() + 1); };

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <BackButton />
      <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        Riwayat Transfer
      </h1>

      {/* Filter bulan */}
      <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-card px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
        <button type="button" onClick={prevMonth} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-card-subtle hover:text-foreground transition-colors">
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {MONTH_NAMES[month - 1]} {year}
          </p>
          {!isCurrentMonth && (
            <button type="button" onClick={goToCurrentMonth} className="text-[11px] text-accent hover:underline">
              Kembali ke bulan ini
            </button>
          )}
        </div>
        <button type="button" onClick={nextMonth} disabled={isCurrentMonth} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-card-subtle hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight className="size-4" />
        </button>
      </div>

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
          Belum ada transfer bulan ini.
        </div>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {items.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {t.fromWalletName} ke {t.toWalletName}
                  </span>
                  <span className="text-xs text-muted">
                    {t.note ? `${t.note} · ` : ""}{formatRelativeDate(t.transferDate)}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(t.amount)}
                </span>
                <ActionMenu onDelete={() => setConfirmId(t.id)} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmModal
        open={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        title="Batalkan transfer ini?"
        description="Saldo akan dikembalikan ke masing-masing dompet."
        confirmLabel="Batalkan transfer"
      />
    </div>
  );
}
