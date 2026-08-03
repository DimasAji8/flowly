"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api-client";
import { savingsGoalsService } from "@/services/savings-goals.service";
import { useWalletStore } from "@/store/wallets.store";
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

export function SavingsGoalContributionModal({ open, goal, onClose, onSuccess }: SavingsGoalContributionModalProps) {
  const { wallets, fetch: fetchWallets, invalidate: invalidateWallets } = useWalletStore();
  const [amountDisplay, setAmountDisplay] = useState("");
  const [fromWalletId, setFromWalletId] = useState("");
  const [isMonthlyAllocation, setIsMonthlyAllocation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "confirm">("form");

  useEffect(() => {
    if (open) {
      void fetchWallets();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAmountDisplay("");
      setFromWalletId("");
      setIsMonthlyAllocation(true);
      setError(null);
      setStep("form");
    }
  }, [open, fetchWallets]);

  useEffect(() => {
    if (open && wallets.length > 0 && !fromWalletId) {
      const defaultWallet = goal?.linkedWalletId && wallets.some((w) => w.id === goal.linkedWalletId)
        ? goal.linkedWalletId
        : wallets[0]?.id ?? "";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFromWalletId(defaultWallet);
    }
  }, [open, wallets, goal, fromWalletId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contribution = parseRupiah(amountDisplay);
    if (!Number.isFinite(contribution) || contribution <= 0) {
      setError("Nominal setoran harus lebih dari 0");
      return;
    }

    if (fromWalletId) {
      const wallet = wallets.find((w) => w.id === fromWalletId);
      if (wallet && Number(wallet.balance) < contribution) {
        setError(`Saldo ${wallet.name} tidak cukup (sisa: Rp ${formatRupiah(String(wallet.balance))})`);
        return;
      }
    }

    setError(null);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!goal) return;
    const contribution = parseRupiah(amountDisplay);
    try {
      setLoading(true);
      await savingsGoalsService.addContribution(goal.id, contribution, fromWalletId || undefined, isMonthlyAllocation);
      toast.success("Setoran tabungan ditambahkan & saldo dompet terpotong");
      invalidateWallets();
      window.dispatchEvent(new Event("flowly:transaction-added"));
      onClose();
      await onSuccess();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menambah setoran");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const selectedWallet = wallets.find((w) => w.id === fromWalletId);
  const title = step === "confirm"
    ? "Konfirmasi setoran"
    : goal ? `Tambah setoran · ${goal.name}` : "Tambah setoran";

  const walletOptions = wallets.map((w) => ({
    value: w.id,
    label: `${w.name} (Rp ${formatRupiah(String(w.balance))})`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      onBack={step === "confirm" ? () => setStep("form") : undefined}
      title={title}
    >
      {step === "form" ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {goal && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-success/25 bg-success/8 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-success/80">Saldo saat ini</p>
                <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
                  {formatCurrency(goal.currentAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-danger/25 bg-danger/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-danger/80">Sisa</p>
                <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
                  {formatCurrency(Math.max(Number(goal.targetAmount) - Number(goal.currentAmount), 0))}
                </p>
              </div>
            </div>
          )}

          {wallets.length > 0 && (
            <Select
              label="Dompet asal (Sumber Uang)"
              options={walletOptions}
              value={fromWalletId}
              onChange={(e) => setFromWalletId(e.target.value)}
              placeholder="Pilih dompet asal..."
              required
            />
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

          <label className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-card-subtle/50 p-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMonthlyAllocation}
              onChange={(e) => setIsMonthlyAllocation(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border-subtle text-accent focus:ring-accent accent-accent"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-foreground">
                Potong dari Anggaran Bulan Ini
              </span>
              <span className="text-[11px] text-muted leading-tight">
                Centang jika setoran ini adalah tabungan dari gaji/pemasukan bulan ini.
              </span>
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Batal</Button>
            <Button type="submit" className="flex-1">Simpan setoran</Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border-subtle bg-card-subtle px-4 py-3 text-sm text-foreground space-y-1">
            <p className="font-medium">{goal?.name}</p>
            <p className="text-success font-semibold">+ Rp {amountDisplay}</p>
            {selectedWallet && (
              <p className="text-xs text-muted">
                Dipotong dari: <span className="font-medium text-foreground">{selectedWallet.name}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep("form")}>Batal</Button>
            <Button type="button" isLoading={loading} className="flex-1" onClick={handleConfirm}>Ya, tambah setoran</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
