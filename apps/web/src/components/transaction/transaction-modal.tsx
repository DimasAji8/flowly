"use client";

import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "@/components/forms/transaction-form";
import { transactionsService } from "@/services/transactions.service";
import type { CreateTransactionFormValues } from "@/lib/transaction-schemas";
import type { Transaction } from "@/types/finance";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Jika diisi → edit mode */
  transaction?: Transaction;
}

export function TransactionModal({ open, onClose, onSuccess, transaction }: TransactionModalProps) {
  const isEdit = Boolean(transaction);

  const handleSubmit = async (values: CreateTransactionFormValues) => {
    if (isEdit && transaction) {
      await transactionsService.update(transaction.id, {
        type: values.type,
        amount: values.amount,
        categoryId: values.categoryId,
        walletId: values.walletId,
        note: values.note,
        transactionDate: values.transactionDate,
      });
      toast.success("Transaksi diperbarui");
    } else {
      await transactionsService.create({
        type: values.type,
        amount: values.amount,
        categoryId: values.categoryId,
        walletId: values.walletId,
        note: values.note,
        transactionDate: values.transactionDate,
      });
      toast.success("Transaksi ditambahkan");
    }
    onClose();
    onSuccess();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit transaction" : "New transaction"}
    >
      <TransactionForm
        submitLabel={isEdit ? "Save changes" : "Save transaction"}
        defaultValues={
          transaction
            ? {
                type: transaction.type,
                amount: Number(transaction.amount),
                categoryId: transaction.categoryId,
                walletId: transaction.walletId,
                note: transaction.note ?? "",
                transactionDate: transaction.transactionDate,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        secondaryAction={
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Cancel
          </button>
        }
      />
    </Modal>
  );
}
