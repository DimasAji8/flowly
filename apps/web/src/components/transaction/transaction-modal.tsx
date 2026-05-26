"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "@/components/forms/transaction-form";
import { transactionsService } from "@/services/transactions.service";
import type { CreateTransactionFormValues } from "@/lib/transaction-schemas";
import type { Transaction, TransactionType } from "@/types/finance";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: Transaction;
}

export function TransactionModal({ open, onClose, onSuccess, transaction }: TransactionModalProps) {
  const isEdit = Boolean(transaction);
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  const handleSubmit = async (values: CreateTransactionFormValues) => {
    if (isEdit && transaction) {
      await transactionsService.update(transaction.id, {
        type: values.type, amount: values.amount, categoryId: values.categoryId,
        walletId: values.walletId, note: values.note, transactionDate: values.transactionDate,
      });
      toast.success("Transaksi diperbarui");
    } else {
      await transactionsService.create({
        type: values.type, amount: values.amount, categoryId: values.categoryId,
        walletId: values.walletId, note: values.note, transactionDate: values.transactionDate,
      });
      toast.success("Transaksi ditambahkan");
    }
    handleClose();
    onSuccess();
  };

  // Edit mode → langsung ke form
  const showPicker = !isEdit && selectedType === null;

  return (
    <Modal open={open} onClose={handleClose} title={isEdit ? "Edit transaksi" : showPicker ? "Tambah transaksi" : selectedType === "income" ? "Pemasukan" : "Pengeluaran"}>
      {showPicker ? (
        <div className="flex flex-col gap-3 py-2">
          <button
            type="button"
            onClick={() => setSelectedType("income")}
            className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-[var(--color-success)] hover:bg-success/5"
          >
            <ArrowUpCircle className="size-8 shrink-0 text-success" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold text-foreground">Pemasukan</p>
              <p className="text-xs text-muted">Gaji, transfer masuk, dll.</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("expense")}
            className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-danger hover:bg-danger/5"
          >
            <ArrowDownCircle className="size-8 shrink-0 text-danger" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold text-foreground">Pengeluaran</p>
              <p className="text-xs text-muted">Belanja, tagihan, dll.</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="flowly-enter">
        <TransactionForm
          submitLabel={isEdit ? "Simpan perubahan" : "Simpan transaksi"}
          hideTypeToggle={!isEdit}
          defaultValues={
            transaction
              ? { type: transaction.type, amount: Number(transaction.amount), categoryId: transaction.categoryId, walletId: transaction.walletId, note: transaction.note ?? "", transactionDate: transaction.transactionDate }
              : { type: selectedType ?? "expense" }
          }
          onSubmit={handleSubmit}
          secondaryAction={
            <button type="button" onClick={handleClose} className="text-sm text-secondary hover:text-foreground">
              Batal
            </button>
          }
        />
        </div>
      )}
    </Modal>
  );
}
