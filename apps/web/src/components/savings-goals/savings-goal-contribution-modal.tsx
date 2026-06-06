"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api-client";
import { savingsGoalsService } from "@/services/savings-goals.service";
import type { SavingsGoal } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";

interface SavingsGoalContributionModalProps {
  open: boolean;
  goal?: SavingsGoal;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

function formatRupiah(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseRupiah(formatted: string): number {
  return Number(formatted.replace(/\./g, "")) || 0;
}

export function SavingsGoalContributionModal({
  open,
  goal,
  onClose,
  onSuccess,
}: SavingsGoalContributionModalProps) {
  const [amountDisplay, setAmountDisplay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setAmountDisplay("");
      setError(null);
      setConfirmOpen(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    const contribution = parseRupiah(amountDisplay);
    if (!Number.isFinite(contribution) || contribution <= 0) {
      setError("Nominal setoran harus lebih dari 0");
      return;
    }
    setError(null);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!goal) return;
    const contribution = parseRupiah(amountDisplay);
    try {
      setLoading(true);
      await savingsGoalsService.update(goal.id, {
        currentAmount: Number(goal.currentAmount) + contribution,
      });
      toast.success("Setoran tabungan ditambahkan");
      setConfirmOpen(false);
      onClose();
      await onSuccess();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menambah setoran");
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={goal ? `Tambah setoran · ${goal.name}` : "Tambah setoran"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {goal && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-success/25 bg-success/8 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-success/80">
                  Saldo saat ini
                </p>
                <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
                  {formatCurrency(goal.currentAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-danger/25 bg-danger/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-danger/80">
                  Sisa
                </p>
                <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
                  {formatCurrency(Math.max(Number(goal.targetAmount) - Number(goal.currentAmount), 0))}
                </p>
              </div>
            </div>
          )}

          <Input
            label="Nominal setoran"
            inputMode="numeric"
            placeholder="0"
            leftAdornment={<span className="font-medium">Rp</span>}
            value={amountDisplay}
            onChange={(e) => setAmountDisplay(formatRupiah(e.target.value))}
            required
          />

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1">
              Simpan setoran
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Konfirmasi Setoran"
        description={[
          goal?.name,
          `+ Rp ${amountDisplay}`,
        ].filter(Boolean).join("  ·  ")}
        confirmLabel="Ya, Tambah Setoran"
        confirmVariant="primary"
        loading={loading}
      />
    </>
  );
}