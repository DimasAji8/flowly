"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { BackButton } from "@/components/ui/back-button";
import { ActionMenu } from "@/components/ui/action-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { TransferModal } from "@/components/wallet/transfer-modal";
import { ApiError } from "@/lib/api-client";
import { walletsService } from "@/services/wallets.service";
import type { Wallet } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";
import { ROUTES } from "@/constants/routes";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState("");

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState<string | undefined>();
  const [confirmWallet, setConfirmWallet] = useState<{ id: string; name: string } | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const w = await walletsService.list();
      setWallets(w);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setCreating(true);
      await walletsService.create({ name: newName.trim(), balance: newBalance ? Number(newBalance) : 0 });
      setNewName(""); setNewBalance("");
      setAddOpen(false);
      toast.success("Dompet ditambahkan");
      await reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal membuat dompet");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWallet = async (id: string, name: string) => {
    try {
      await walletsService.remove(id);
      toast.success(`Dompet "${name}" dihapus`);
      setConfirmWallet(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus dompet");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <BackButton />

      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Dompet
        </h1>
        <Button size="sm" leftIcon={<Plus className="size-4" aria-hidden />} onClick={() => setAddOpen(true)}>
          Tambah
        </Button>
      </header>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-card p-6 text-center text-sm text-muted">
          Memuat…
        </div>
      ) : wallets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-secondary">
          Belum ada dompet.
        </div>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {wallets.map((w) => (
              <li key={w.id} className="flex items-center gap-3 px-5 py-4">
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-foreground">{w.name}</span>
                  <span className="text-xs text-muted tabular-nums">
                    Saldo: {formatCurrency(w.balance)}
                  </span>
                </div>
                <ActionMenu
                  onTransfer={wallets.length >= 2 ? () => { setTransferFromId(w.id); setTransferOpen(true); } : undefined}
                  onDelete={() => setConfirmWallet({ id: w.id, name: w.name })}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Link
        href={ROUTES.walletTransfers}
        className="flex items-center justify-between rounded-xl border border-border-subtle bg-card px-5 py-4 text-sm font-medium text-foreground hover:bg-card-subtle transition-colors"
      >
        Lihat riwayat transfer
        <ArrowRight className="size-4 text-muted" aria-hidden />
      </Link>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setNewName(""); setNewBalance(""); }} title="Tambah dompet">
        <form onSubmit={handleCreateWallet} className="flex flex-col gap-4">
          <Input label="Nama" placeholder="mis. BCA" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} required />
          <Input label="Saldo awal" type="number" inputMode="decimal" step="0.01" placeholder="0" leftAdornment={<span className="font-medium">Rp</span>} value={newBalance} onChange={(e) => setNewBalance(e.target.value)} />
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => setAddOpen(false)} className="text-sm text-muted hover:text-foreground">
              Batal
            </button>
            <Button type="submit" isLoading={creating} disabled={!newName.trim()}>
              Tambah
            </Button>
          </div>
        </form>
      </Modal>

      <TransferModal
        open={transferOpen}
        onClose={() => { setTransferOpen(false); setTransferFromId(undefined); }}
        onSuccess={reload}
        wallets={wallets}
        defaultFromId={transferFromId}
      />

      <ConfirmModal
        open={Boolean(confirmWallet)}
        onClose={() => setConfirmWallet(null)}
        onConfirm={() => confirmWallet && handleDeleteWallet(confirmWallet.id, confirmWallet.name)}
        title={`Hapus dompet "${confirmWallet?.name}"?`}
        description="Dompet tidak bisa dihapus jika masih memiliki transaksi."
      />
    </div>
  );
}
