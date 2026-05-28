"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { RecurringForm } from "@/components/forms/recurring-form";
import { recurringService } from "@/services/recurring.service";
import type { TransactionType } from "@/types/finance";

interface RecurringModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecurringModal({ open, onClose, onSuccess }: RecurringModalProps) {
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  const showPicker = selectedType === null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        showPicker
          ? "Tambah recurring"
          : selectedType === "income"
            ? "Recurring Pemasukan"
            : "Recurring Pengeluaran"
      }
    >
      {showPicker ? (
        <div className="flex flex-col gap-3 py-2">
          <button
            type="button"
            onClick={() => setSelectedType("income")}
            className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-success hover:bg-success/5"
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
              <p className="text-xs text-muted">Belanja, tagihan, langganan, dll.</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="flowly-enter">
          <RecurringForm
            submitLabel="Simpan"
            hideTypeToggle
            defaultValues={{ type: selectedType }}
            onSubmit={async (values) => {
              await recurringService.create({
                type: values.type,
                amount: values.amount,
                categoryId: values.categoryId,
                walletId: values.walletId,
                frequency: values.frequency,
                nextRunAt: values.nextRunAt,
                note: values.note,
                isActive: values.isActive ?? true,
              });
              toast.success("Recurring ditambahkan");
              handleClose();
              onSuccess();
            }}
            secondaryAction={
              <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                Batal
              </Button>
            }
          />
        </div>
      )}
    </Modal>
  );
}
