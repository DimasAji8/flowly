"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/forms/transaction-form";
import { FormError } from "@/components/ui/form-error";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-client";
import { transactionsService } from "@/services/transactions.service";
import type { Transaction } from "@/types/finance";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    transactionsService
      .getById(id)
      .then((data) => {
        if (!cancelled) setTx(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(
            e instanceof ApiError ? e.message : "Failed to load transaction",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await transactionsService.remove(id);
      router.replace(ROUTES.transactions);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Failed to delete transaction",
      );
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <BackButton />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Edit transaksi
        </h1>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-card p-6 text-center text-sm text-muted">
          Memuat…
        </div>
      ) : error && !tx ? (
        <FormError message={error} />
      ) : tx ? (
        <>
          <TransactionForm
            submitLabel="Simpan perubahan"
            defaultValues={{
              type: tx.type,
              amount: Number(tx.amount),
              categoryId: tx.categoryId,
              walletId: tx.walletId,
              note: tx.note ?? "",
              transactionDate: tx.transactionDate,
            }}
            onSubmit={async (values) => {
              await transactionsService.update(tx.id, {
                type: values.type,
                amount: values.amount,
                categoryId: values.categoryId,
                walletId: values.walletId,
                note: values.note,
                transactionDate: values.transactionDate,
              });
              router.replace(ROUTES.transactions);
            }}
          />

          <div className="mt-6 border-t border-border-subtle pt-6">
            <Button
              variant="danger"
              onClick={() => setConfirmOpen(true)}
              isLoading={deleting}
              leftIcon={<Trash2 className="size-4" aria-hidden />}
              className="w-full md:w-auto md:px-8"
            >
              Hapus transaksi
            </Button>
          </div>

          <ConfirmModal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleDelete}
            title="Hapus transaksi ini?"
            description="Tindakan ini tidak bisa di-undo."
          />
        </>
      ) : null}
    </div>
  );
}
