"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionModal } from "@/components/transaction/transaction-modal";
import { DeleteTransactionModal } from "@/components/transaction/delete-transaction-modal";
import { FilterBar } from "@/components/ui/filter-bar";
import { ApiError } from "@/lib/api-client";
import { transactionsService } from "@/services/transactions.service";
import { useWalletStore } from "@/store/wallets.store";
import { useCategoryStore } from "@/store/categories.store";
import type { Transaction, TransactionType } from "@/types/finance";
import { ROUTES } from "@/constants/routes";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const TYPE_OPTIONS = [
  { label: "Semua", value: "all" as const },
  { label: "Pemasukan", value: "income" as const },
  { label: "Pengeluaran", value: "expense" as const },
];

export default function TransactionsPage() {
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const d = new Date();
    // setState di effect disengaja: tanggal "sekarang" hanya valid di klien (hindari hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setMounted(true);
  }, []);

  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [walletFilter, setWalletFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { wallets, fetch: fetchWallets } = useWalletStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();

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
      .list({
        limit: 500, page: 1, from, to,
        ...(typeFilter !== "all" ? { type: typeFilter } : {}),
        ...(walletFilter !== "all" ? { walletId: walletFilter } : {}),
        ...(categoryFilter !== "all" ? { categoryId: categoryFilter } : {}),
      })
      .then((res) => setItems(res.data))
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? e.message : "Gagal memuat transaksi");
      })
      .finally(() => setLoading(false));
  }, [year, month, mounted, typeFilter, walletFilter, categoryFilter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    // Muat data store sekali saat mount (action store mengembalikan promise).
    fetchWallets();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <Link href={ROUTES.dashboard} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors w-fit lg:hidden">
        <ArrowLeft className="size-4" />
        Kembali
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">
          Transaksi
        </h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          <Plus className="size-4" />
          Tambah
        </button>
      </div>

      {/* Filter bulan */}
      <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-card px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
        <button
          type="button"
          onClick={prevMonth}
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-card-subtle hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {MONTH_NAMES[month - 1]} {year}
          </p>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={goToCurrentMonth}
              className="text-[11px] text-accent hover:underline"
            >
              Kembali ke bulan ini
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-card-subtle hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {mounted && (
        <FilterBar filters={[
          { key: "type", type: "chip", label: "Tipe", options: TYPE_OPTIONS, value: typeFilter, onChange: (v) => { setTypeFilter(v); setCategoryFilter("all"); } },
          { key: "wallet", type: "dropdown", label: "Dompet", value: walletFilter, onChange: setWalletFilter, options: [{ value: "all", label: "Semua dompet" }, ...wallets.map((w) => ({ value: w.id, label: w.name }))] },
          { key: "category", type: "dropdown", label: "Kategori", value: categoryFilter, onChange: setCategoryFilter, options: [{ value: "all", label: "Semua kategori" }, ...categories.filter((c) => typeFilter === "all" || c.type === typeFilter).map((c) => ({ value: c.id, label: c.name }))] },
        ]} />
      )}

      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <TransactionList
        items={items}
        loading={loading}
        grouped
        onItemClick={(tx) => setEditTx(tx)}
        onAdd={() => setAddOpen(true)}
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
