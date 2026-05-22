"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionModal } from "@/components/transaction/transaction-modal";
import { DeleteTransactionModal } from "@/components/transaction/delete-transaction-modal";
import { ApiError } from "@/lib/api-client";
import { transactionsService } from "@/services/transactions.service";
import type { Transaction } from "@/types/finance";

export default function TransactionsPage() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    transactionsService
      .list({ limit: 50, page: 1 })
      .then((res) => setItems(res.data))
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? e.message : "Failed to load transactions");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("flowly:transaction-added", handler);
    return () => window.removeEventListener("flowly:transaction-added", handler);
  }, [load]);

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] md:text-2xl">
          Transactions
        </h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          + Add
        </Button>
      </header>

      {error && (
        <div className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] px-2 py-2">
        <TransactionList
          items={items}
          loading={loading}
          onItemClick={(tx) => setEditTx(tx)}
        />
      </div>

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
