"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { transfersService } from "@/services/transfers.service";
import { ApiError } from "@/lib/api-client";
import { isoToday } from "@/utils/format-date";
import type { Wallet } from "@/types/finance";

function formatRupiah(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseRupiah(formatted: string): number {
  return Number(formatted.replace(/\./g, "")) || 0;
}

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wallets: Wallet[];
  defaultFromId?: string;
}

function WalletDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Wallet[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((w) => w.id === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">
        {label}
      </span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-full items-center justify-between rounded-lg border border-border-subtle bg-card-subtle px-3 text-sm text-foreground transition-colors hover:border-accent"
        >
          <span className={selected ? "" : "text-muted"}>
            {selected?.name ?? "Pilih dompet"}
          </span>
          <ChevronDown className="size-4 text-muted" />
        </button>
        {open && (
          <div className="absolute left-0 top-12 z-60 w-full overflow-hidden rounded-xl border border-border-subtle bg-card shadow-(--shadow-modal)">
            {options.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => { onChange(w.id); setOpen(false); }}
                className="flex w-full items-center px-4 py-2.5 text-sm text-foreground hover:bg-card-subtle"
              >
                {w.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TransferModal({ open, onClose, onSuccess, wallets, defaultFromId }: TransferModalProps) {
  const [form, setForm] = useState({
    fromId: defaultFromId ?? "",
    toId: "",
    amountDisplay: "",
    amountValue: 0,
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setForm({ fromId: defaultFromId ?? "", toId: "", amountDisplay: "", amountValue: 0, note: "" });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromId || !form.toId) {
      toast.error("Pilih dompet asal dan tujuan");
      return;
    }
    try {
      setLoading(true);
      await transfersService.create({
        fromWalletId: form.fromId,
        toWalletId: form.toId,
        amount: form.amountValue,
        note: form.note || undefined,
        transferDate: isoToday(),
      });
      toast.success("Transfer berhasil");
      handleClose();
      onSuccess();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal transfer");
    } finally {
      setLoading(false);
    }
  };

  const fromOptions = wallets.filter((w) => w.id !== form.toId);
  const toOptions = wallets.filter((w) => w.id !== form.fromId);

  return (
    <Modal open={open} onClose={handleClose} title="Transfer antar dompet">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <WalletDropdown label="Dari" options={fromOptions} value={form.fromId} onChange={(id) => setForm((f) => ({ ...f, fromId: id }))} />
          </div>
          <div className="mb-1.5 shrink-0 text-muted">
            <ArrowRight className="size-4" aria-hidden />
          </div>
          <div className="flex-1">
            <WalletDropdown label="Ke" options={toOptions} value={form.toId} onChange={(id) => setForm((f) => ({ ...f, toId: id }))} />
          </div>
        </div>

        <Input
          label="Jumlah"
          inputMode="numeric"
          placeholder="0"
          leftAdornment={<span className="font-medium">Rp</span>}
          value={form.amountDisplay}
          onChange={(e) => {
            const formatted = formatRupiah(e.target.value);
            setForm((f) => ({ ...f, amountDisplay: formatted, amountValue: parseRupiah(formatted) }));
          }}
          required
        />

        <Input
          label="Catatan (opsional)"
          placeholder="mis. Top up GoPay"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />

        <div className="flex items-center gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1" disabled={!form.fromId || !form.toId || form.amountValue <= 0}>
            Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
