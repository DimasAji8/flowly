"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { transactionsService } from "@/services/transactions.service";

interface DeleteTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionId: string;
}

export function DeleteTransactionModal({ open, onClose, onSuccess, transactionId }: DeleteTransactionModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await transactionsService.remove(transactionId);
      toast.success("Transaksi dihapus");
      onClose();
      onSuccess();
    } catch {
      toast.error("Gagal menghapus transaksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Hapus transaksi?">
      <p className="mb-6 text-sm text-secondary">
        Tindakan ini tidak bisa di-undo. Saldo wallet akan dikembalikan.
      </p>
      <div className="flex gap-3">
        <Button variant="danger" isLoading={loading} onClick={handleDelete} leftIcon={<Trash2 className="size-4" />} className="flex-1">
          Hapus
        </Button>
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Batal
        </Button>
      </div>
    </Modal>
  );
}
