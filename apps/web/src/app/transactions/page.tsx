"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionModal } from "@/components/transaction/transaction-modal";
import { DeleteTransactionModal } from "@/components/transaction/delete-transaction-modal";
import { ApiError } from "@/lib/api-client";
import { transactionsService } from "@/services/transactions.service";
import type { Transaction } from "@/types/finance";
import { ROUTES } from "@/constants/routes";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function TransactionsPage() {
  const now = new Date();
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setMounted(true);
  }, []);

  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!mounted || !year || !month) return;
    setLoading(true);
    setError(null);
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    transactionsService
      .list({ limit: 500, page: 1, from, to })
      .then((res) => setItems(res.data))
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? e.message : "Gagal memuat transaksi");
      })
      .finally(() => setLoading(false));
  }, [year, month, mounted]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("flowly:transaction-added", handler);
    return () => window.removeEventListener("flowly:transaction-added", handler);
  }, [load]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const goToCurrentMonth = () => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const isCurrentMonth = mounted && year === new Date().getFullYear() && month === new Date().getMonth() + 1;

  return (
    <div className="flex flex-col gap-5 max-w-3xl flowly-enter">
      {/* Mobile: back button */}
      <Link href={ROUTES.dashboard} className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors w-fit md:hidden">
        <ArrowLeft className="size-4" />
        Kembali
      </Link>

      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] md:text-2xl">
          Transaksi
        </h1>

      {/* Filter bulan */}
      <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
        <button
          type="button"
          onClick={prevMonth}
          className="grid size-8 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-card-subtle)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {MONTH_NAMES[month - 1]} {year}
          </p>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={goToCurrentMonth}
              className="text-[11px] text-[var(--color-accent)] hover:underline"
            >
              Kembali ke bulan ini
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="grid size-8 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-card-subtle)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <TransactionList
        items={items}
        loading={loading}
        grouped
        onItemClick={(tx) => setEditTx(tx)}
      />

      <TransactionModal
        open={addOpen || Boolean(editTx)}
        onClose={() => { setAddOpen(false); setEditTx(null); }}
        onSuccess={load}
        transaction={editTx ?? undefined}
      />

      {deleteTxId && (
        <DeleteTransactionModal
          open={Boolean(deleteTxId)}
          onClose={() => setDeleteTxId(null)}
          onSuccess={load}
          transactionId={deleteTxId}
        />
      )}
    </div>
  );
}
