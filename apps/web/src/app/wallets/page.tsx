"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { BackButton } from "@/components/ui/back-button";
import { ActionMenu } from "@/components/ui/action-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { TransferModal } from "@/components/wallet/transfer-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiError } from "@/lib/api-client";
import { walletsService } from "@/services/wallets.service";
import { useWalletStore } from "@/store/wallets.store";
import type { Wallet, WalletType } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";
import { ROUTES } from "@/constants/routes";

const WALLET_TYPE_OPTIONS: { value: WalletType; label: string }[] = [
  { value: "bank", label: "Bank" },
  { value: "e_wallet", label: "E-Wallet" },
  { value: "cash", label: "Tunai" },
  { value: "credit", label: "Kartu Kredit" },
  { value: "savings", label: "Tabungan" },
  { value: "other", label: "Lainnya" },
];

const WALLET_TYPE_LABEL: Record<WalletType, string> = {
  bank: "Bank",
  e_wallet: "E-Wallet",
  cash: "Tunai",
  credit: "Kartu Kredit",
  savings: "Tabungan",
  other: "Lainnya",
};

const WALLET_TYPE_ORDER: WalletType[] = ["bank", "savings", "e_wallet", "cash", "credit", "other"];

function formatRupiah(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseRupiah(formatted: string): number {
  return Number(formatted.replace(/\./g, "")) || 0;
}

export default function WalletsPage() {
  const { wallets, loading, error, fetch: fetchWallets } = useWalletStore();

  const reload = () => {
    useWalletStore.getState().invalidate();
    void useWalletStore.getState().fetch();
  };
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBalanceDisplay, setNewBalanceDisplay] = useState("");
  const [newType, setNewType] = useState<WalletType>("cash");

  const [editWallet, setEditWallet] = useState<Wallet | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<WalletType>("cash");
  const [updating, setUpdating] = useState(false);

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState<string | undefined>();
  const [confirmWallet, setConfirmWallet] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    void fetchWallets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setCreating(true);
      await walletsService.create({ name: newName.trim(), type: newType, balance: parseRupiah(newBalanceDisplay) });
      setNewName(""); setNewBalanceDisplay(""); setNewType("cash");
      setAddOpen(false);
      toast.success("Dompet ditambahkan");
      reload();
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
      reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus dompet");
    }
  };

  const openEdit = (w: Wallet) => {
    setEditWallet(w);
    setEditName(w.name);
    setEditType(w.type);
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWallet || !editName.trim()) return;
    try {
      setUpdating(true);
      await walletsService.update(editWallet.id, { name: editName.trim(), type: editType });
      setEditWallet(null);
      toast.success("Dompet diperbarui");
      reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal memperbarui dompet");
    } finally {
      setUpdating(false);
    }
  };

  const grouped = WALLET_TYPE_ORDER
    .map((type) => ({ type, items: wallets.filter((w) => w.type === type) }))
    .filter((g) => g.items.length > 0);

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
        <div className="flex flex-col gap-5">
          {grouped.map(({ type, items }) => (
            <div key={type} className="flex flex-col gap-2">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">
                {WALLET_TYPE_LABEL[type]}
              </p>
              <div className="flex flex-col gap-2">
                {items.map((w) => (
                  <div key={w.id} className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-card px-5 py-4">
                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate">{w.name}</span>
                      <span className="text-[11px] uppercase tracking-wide text-muted">{WALLET_TYPE_LABEL[w.type]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold tabular-nums text-foreground text-right">
                        {formatCurrency(w.balance)}
                      </span>
                      <ActionMenu
                        onEdit={() => openEdit(w)}
                        onTransfer={wallets.length >= 2 ? () => { setTransferFromId(w.id); setTransferOpen(true); } : undefined}
                        onDelete={() => setConfirmWallet({ id: w.id, name: w.name })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href={ROUTES.walletTransfers}
        className="flex items-center justify-between rounded-xl border border-border-subtle bg-card px-5 py-4 text-sm font-medium text-foreground hover:bg-card-subtle transition-colors"
      >
        Lihat riwayat transfer
        <ArrowRight className="size-4 text-muted" aria-hidden />
      </Link>

      {/* Modal tambah dompet */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setNewName(""); setNewBalanceDisplay(""); setNewType("cash"); }} title="Tambah dompet">
        <form onSubmit={handleCreateWallet} className="flex flex-col gap-4">
          <Input label="Nama" placeholder="mis. BCA" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} required />
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Tipe</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-between rounded-lg border border-border-subtle bg-card-subtle px-3 text-sm text-foreground transition-colors hover:border-accent"
                >
                  <span>{WALLET_TYPE_LABEL[newType]}</span>
                  <ChevronDown className="size-4 text-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
                {WALLET_TYPE_OPTIONS.map((o) => (
                  <DropdownMenuItem key={o.value} onSelect={() => setNewType(o.value)} className="flex items-center justify-between">
                    <span>{o.label}</span>
                    {o.value === newType && <Check className="size-4 text-accent" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Input label="Saldo awal" inputMode="numeric" placeholder="0" leftAdornment={<span className="font-medium">Rp</span>} value={newBalanceDisplay} onChange={(e) => setNewBalanceDisplay(formatRupiah(e.target.value))} />
          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={creating} className="flex-1" disabled={!newName.trim()}>
              Tambah
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal edit dompet */}
      <Modal open={Boolean(editWallet)} onClose={() => setEditWallet(null)} title="Edit dompet">
        <form onSubmit={handleUpdateWallet} className="flex flex-col gap-4">
          <Input label="Nama" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={60} required />
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Tipe</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-between rounded-lg border border-border-subtle bg-card-subtle px-3 text-sm text-foreground transition-colors hover:border-accent"
                >
                  <span>{WALLET_TYPE_LABEL[editType]}</span>
                  <ChevronDown className="size-4 text-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
                {WALLET_TYPE_OPTIONS.map((o) => (
                  <DropdownMenuItem key={o.value} onSelect={() => setEditType(o.value)} className="flex items-center justify-between">
                    <span>{o.label}</span>
                    {o.value === editType && <Check className="size-4 text-accent" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditWallet(null)}>
              Batal
            </Button>
            <Button type="submit" isLoading={updating} className="flex-1" disabled={!editName.trim()}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <TransferModal
        key={`${transferOpen}-${transferFromId ?? ""}`}
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
