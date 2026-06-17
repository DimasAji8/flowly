"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/store/wallets.store";
import { transfersService } from "@/services/transfers.service";
import { walletsService } from "@/services/wallets.service";
import { ApiError } from "@/lib/api-client";
import { isoToday } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-currency";
import type { Wallet } from "@/types/finance";

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultFromId?: string;
}

type Step = "form" | "confirm";

const CASH_WALLET_NAME = "Tunai";

function formatRupiah(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseRupiah(formatted: string): number {
  return Number(formatted.replace(/\./g, "")) || 0;
}

export function WithdrawalModal({
  open,
  onClose,
  onSuccess,
  defaultFromId,
}: WithdrawalModalProps) {
  const { wallets } = useWalletStore();

  const [step, setStep] = useState<Step>("form");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [amountValue, setAmountValue] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Find source wallet (pre-filled from ActionMenu)
  const sourceWallet: Wallet | undefined = useMemo(
    () => wallets.find((w) => w.id === defaultFromId),
    [wallets, defaultFromId],
  );

  // Find existing cash wallet (or null)
  const existingCashWallet: Wallet | undefined = useMemo(
    () => wallets.find((w) => w.type === "cash"),
    [wallets],
  );

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep("form");
      setAmountDisplay("");
      setAmountValue(0);
      setNote("");
    }
  }, [open]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWallet) {
      toast.error("Dompet asal tidak ditemukan");
      return;
    }
    if (amountValue <= 0) {
      toast.error("Masukkan jumlah yang valid");
      return;
    }
    if (Number(sourceWallet.balance) < amountValue) {
      toast.error("Saldo tidak cukup");
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!sourceWallet) return;
    try {
      setLoading(true);

      // 1. Get-or-create cash wallet (Tunai)
      let cashWallet = existingCashWallet;
      if (!cashWallet) {
        cashWallet = await walletsService.create({
          name: CASH_WALLET_NAME,
          type: "cash",
          balance: 0,
        });
      }

      // 2. Create the transfer (this updates balances atomically on the backend)
      await transfersService.create({
        fromWalletId: sourceWallet.id,
        toWalletId: cashWallet.id,
        amount: amountValue,
        note: note || undefined,
        transferDate: isoToday(),
      });

      // 3. Refresh wallet list to reflect new balance / new wallet
      useWalletStore.getState().invalidate();
      void useWalletStore.getState().fetch();

      toast.success("Tarik tunai berhasil");
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal tarik tunai");
    } finally {
      setLoading(false);
    }
  };

  const destinationName = existingCashWallet?.name ?? CASH_WALLET_NAME;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      onBack={step === "confirm" ? () => setStep("form") : undefined}
      title="Tarik Tunai"
    >
      {step === "form" ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Source wallet card */}
          {sourceWallet && (
            <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card-subtle px-4 py-3">
              <div
                className="grid size-9 shrink-0 place-items-center rounded-lg"
                style={{ background: "var(--color-accent-soft)" }}
              >
                <WalletIcon
                  className="size-4"
                  style={{ color: "var(--color-accent)" }}
                  aria-hidden
                />
              </div>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Dari
                </span>
                <span className="text-sm font-semibold text-foreground truncate">
                  {sourceWallet.name}
                </span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(sourceWallet.balance)}
              </span>
            </div>
          )}

          {/* Destination hint */}
          <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-card-subtle px-3.5 py-2.5">
            <Banknote className="size-4 text-muted shrink-0" aria-hidden />
            <span className="text-xs text-secondary">
              {existingCashWallet
                ? `Otomatis masuk ke dompet "${destinationName}"`
                : `Otomatis dibuatkan dompet "${CASH_WALLET_NAME}"`}
            </span>
          </div>

          {/* Amount */}
          <Input
            label="Jumlah tarik tunai"
            inputMode="numeric"
            placeholder="0"
            leftAdornment={<span className="font-medium">Rp</span>}
            value={amountDisplay}
            onChange={(e) => {
              const formatted = formatRupiah(e.target.value);
              setAmountDisplay(formatted);
              setAmountValue(parseRupiah(formatted));
            }}
            required
            autoFocus
          />

          {/* Note */}
          <Input
            label="Catatan (opsional)"
            placeholder="mis. Ambil di ATM BCA"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={amountValue <= 0}
              leftIcon={<Banknote className="size-4" aria-hidden />}
            >
              Lanjut
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Summary */}
          <div className="rounded-2xl border border-border-subtle bg-card-subtle px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Detail tarik tunai
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-secondary">Dari</span>
                <span className="text-sm font-medium text-foreground truncate max-w-[60%] text-right">
                  {sourceWallet?.name}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-secondary">Ke</span>
                <span className="text-sm font-medium text-foreground truncate max-w-[60%] text-right">
                  {destinationName}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 border-t border-border-subtle pt-2.5">
                <span className="text-sm text-secondary">Jumlah</span>
                <span
                  className="text-base font-bold tabular-nums"
                  style={{ color: "var(--color-accent)" }}
                >
                  {formatCurrency(amountValue)}
                </span>
              </div>
              {note && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-secondary">Catatan</span>
                  <span className="text-sm text-foreground truncate max-w-[60%] text-right">
                    {note}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setStep("form")}
              disabled={loading}
            >
              Kembali
            </Button>
            <Button
              type="button"
              isLoading={loading}
              className="flex-1"
              onClick={handleConfirm}
            >
              Konfirmasi
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
