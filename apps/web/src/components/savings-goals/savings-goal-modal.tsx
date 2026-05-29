"use client";

import { useMemo, useState } from "react";
import { CalendarIcon, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ApiError } from "@/lib/api-client";
import { savingsGoalsService } from "@/services/savings-goals.service";
import type { SavingsGoal, Wallet } from "@/types/finance";
import { formatDateLong } from "@/utils/format-date";

interface SavingsGoalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  wallets: Wallet[];
  goal?: SavingsGoal;
}

function formatRupiah(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseRupiah(formatted: string): number {
  return Number(formatted.replace(/\./g, "")) || 0;
}

function toFormValues(goal?: SavingsGoal) {
  return {
    name: goal?.name ?? "",
    targetAmount: goal ? formatRupiah(String(Number(goal.targetAmount))) : "",
    currentAmount: goal ? formatRupiah(String(Number(goal.currentAmount))) : "0",
    targetDate: goal?.targetDate.slice(0, 10) ?? "",
    linkedWalletId: goal?.linkedWalletId ?? "",
    note: goal?.note ?? "",
  };
}

export function SavingsGoalModal({
  open,
  onClose,
  onSuccess,
  wallets,
  goal,
}: SavingsGoalModalProps) {
  const isEdit = Boolean(goal);
  const [form, setForm] = useState(() => toFormValues(goal));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<null | Parameters<typeof savingsGoalsService.create>[0]>(null);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === form.linkedWalletId),
    [form.linkedWalletId, wallets],
  );

  const handleClose = () => {
    setForm(toFormValues(goal));
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Nama target wajib diisi"); return; }
    const targetAmount = parseRupiah(form.targetAmount);
    const currentAmount = parseRupiah(form.currentAmount || "0");
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) { setError("Target nominal harus lebih dari 0"); return; }
    if (!Number.isFinite(currentAmount) || currentAmount < 0) { setError("Nominal terkumpul tidak valid"); return; }
    if (!form.targetDate) { setError("Tanggal target wajib diisi"); return; }
    setError(null);
    setPendingPayload({
      name: form.name.trim(),
      targetAmount,
      currentAmount,
      targetDate: form.targetDate,
      linkedWalletId: form.linkedWalletId || undefined,
      note: form.note.trim() || undefined,
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingPayload) return;
    try {
      setLoading(true);
      setError(null);
      if (isEdit && goal) {
        await savingsGoalsService.update(goal.id, pendingPayload);
        toast.success("Target tabungan diperbarui");
      } else {
        await savingsGoalsService.create(pendingPayload);
        toast.success("Target tabungan ditambahkan");
      }
      setConfirmOpen(false);
      handleClose();
      await onSuccess();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menyimpan target tabungan");
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit target tabungan" : "Tambah target tabungan"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nama target"
          placeholder="mis. Dana darurat"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          maxLength={60}
          required
        />

        <Input
          label="Target nominal"
          inputMode="numeric"
          placeholder="0"
          leftAdornment={<span className="font-medium">Rp</span>}
          value={form.targetAmount}
          onChange={(e) => setForm((prev) => ({ ...prev, targetAmount: formatRupiah(e.target.value) }))}
          required
        />

        {!isEdit && (
          <Input
            label="Saldo awal terkumpul"
            inputMode="numeric"
            placeholder="0"
            leftAdornment={<span className="font-medium">Rp</span>}
            value={form.currentAmount}
            onChange={(e) => setForm((prev) => ({ ...prev, currentAmount: formatRupiah(e.target.value) }))}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Tanggal target</span>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-11 w-full items-center justify-between rounded-lg border border-border-subtle bg-card-subtle px-3 text-left text-sm text-foreground transition-colors hover:border-accent"
              >
                <span>{form.targetDate ? formatDateLong(form.targetDate) : "Pilih tanggal"}</span>
                <CalendarIcon className="size-4 text-muted" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.targetDate ? new Date(form.targetDate + "T00:00:00") : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, "0");
                  const d = String(date.getDate()).padStart(2, "0");
                  setForm((prev) => ({ ...prev, targetDate: `${y}-${m}-${d}` }));
                  setDateOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Dompet terkait (opsional)</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-11 w-full items-center justify-between rounded-lg border border-border-subtle bg-card-subtle px-3 text-sm text-foreground transition-colors hover:border-accent"
              >
                <span>{selectedWallet?.name ?? "Tidak dihubungkan"}</span>
                <ChevronDown className="size-4 text-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
              <DropdownMenuItem
                onSelect={() => setForm((prev) => ({ ...prev, linkedWalletId: "" }))}
                className="flex items-center justify-between"
              >
                <span>Tidak dihubungkan</span>
                {!form.linkedWalletId && <Check className="size-4 text-accent" />}
              </DropdownMenuItem>
              {wallets.map((wallet) => (
                <DropdownMenuItem
                  key={wallet.id}
                  onSelect={() => setForm((prev) => ({ ...prev, linkedWalletId: wallet.id }))}
                  className="flex items-center justify-between"
                >
                  <span>{wallet.name}</span>
                  {wallet.id === form.linkedWalletId && <Check className="size-4 text-accent" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Input
          label="Catatan (opsional)"
          placeholder="mis. 6 bulan biaya hidup"
          value={form.note}
          onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          maxLength={280}
        />

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            {isEdit ? "Simpan" : "Tambah"}
          </Button>
        </div>
      </form>
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={isEdit ? "Simpan perubahan?" : "Tambah target tabungan?"}
        description={pendingPayload ? [
          pendingPayload.name,
          `Target: Rp ${formatRupiah(String(pendingPayload.targetAmount))}`,
        ].join("  ·  ") : undefined}
        confirmLabel={isEdit ? "Simpan" : "Tambah"}
        confirmVariant="primary"
        loading={loading}
      />
    </Modal>
  );
}