"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ActionMenu } from "@/components/ui/action-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [year, setYear] = useState(() => {
    if (typeof window === 'undefined') return 2026;
    return new Date().getFullYear();
  });
  const [month, setMonth] = useState(() => {
    if (typeof window === 'undefined') return 1;
    return new Date().getMonth() + 1;
  });

  const [items, setItems] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    transfersService.list(year, month)
      .then(setItems)
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [year, month, refreshKey]);

  // Refresh data saat transfer ditambah/dihapus dari halaman lain
  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1);
    window.addEventListener("flowly:transaction-added", handler);
    return () => window.removeEventListener("flowly:transaction-added", handler);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await transfersService.remove(id);
      toast.success("Transfer dibatalkan");
      setConfirmId(null);
      setLoading(true);
      setError(null);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal membatalkan transfer");
    }
  };

  const prevMonth = () => {
    setLoading(true); setError(null);
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setLoading(true); setError(null);
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };
  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth() + 1;
  const goToCurrentMonth = () => {
    const d = new Date();
    setLoading(true); setError(null);
    setYear(d.getFullYear()); setMonth(d.getMonth() + 1);
  };

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
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-secondary">
          Belum ada transfer bulan ini.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Summary */}
          <div className="flex gap-2 mb-1">
            <div className="flex-1 rounded-2xl border border-border-subtle bg-card px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-[11px] text-muted uppercase tracking-wide">Total transfer</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-foreground">
                {formatCurrency(items.reduce((s, t) => s + Number(t.amount), 0))}
              </p>
            </div>
            <div className="flex-1 rounded-2xl border border-border-subtle bg-card px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-[11px] text-muted uppercase tracking-wide">Jumlah</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-foreground">
                {items.length}×
              </p>
            </div>
          </div>

          {/* Transfer list */}
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-card px-4 py-3.5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Icon */}
              <div
                className="grid size-10 shrink-0 place-items-center rounded-xl"
                style={{ background: "var(--color-accent-soft)" }}
              >
                <MoveRight className="size-4.5" style={{ color: "var(--color-accent)" }} strokeWidth={2.5} />
              </div>

              {/* Wallet names + meta */}
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="rounded-md bg-card-subtle px-2 py-0.5 text-xs font-medium text-foreground truncate max-w-20">
                    {t.fromWalletName}
                  </span>
                  <ArrowRight className="size-3 shrink-0 text-muted" strokeWidth={2} />
                  <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium truncate max-w-20" style={{ color: "var(--color-accent)" }}>
                    {t.toWalletName}
                  </span>
                </div>
                <span className="text-[11px] text-muted">
                  {t.note ? `${t.note} · ` : ""}{formatRelativeDate(t.transferDate)}
                </span>
              </div>

              {/* Amount + action */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-bold tabular-nums" style={{ color: "var(--color-accent)" }}>
                  {formatCurrency(t.amount)}
                </span>
                <ActionMenu onDelete={() => setConfirmId(t.id)} />
              </div>
            </div>
          ))}
        </div>
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
