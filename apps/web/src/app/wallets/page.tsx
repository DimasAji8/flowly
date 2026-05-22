"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { ActionMenu } from "@/components/ui/action-menu";
import { ApiError } from "@/lib/api-client";
import { walletsService } from "@/services/wallets.service";
import type { Wallet } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState<string>("");

  const reload = async () => {
    setError(null);
    try {
      const data = await walletsService.list();
      setWallets(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load wallets");
    }
  };

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setCreating(true);
      await walletsService.create({
        name: newName.trim(),
        balance: newBalance ? Number(newBalance) : 0,
      });
      setNewName("");
      setNewBalance("");
      toast.success("Wallet ditambahkan");
      await reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to create wallet");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus wallet "${name}"?`)) return;
    try {
      await walletsService.remove(id);
      toast.success(`Wallet "${name}" dihapus`);
      await reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to delete wallet");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <BackButton />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-2xl">
          Wallets
        </h1>
      </header>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-3 py-2.5 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Form add */}
      <Card padding="md">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
            Add wallet
          </h2>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <Input
              label="Name"
              placeholder="e.g. BCA"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={60}
              required
            />
            <Input
              label="Initial balance"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0"
              leftAdornment={<span className="font-medium">Rp</span>}
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
            />
            <div className="flex items-end">
              <Button
                type="submit"
                isLoading={creating}
                leftIcon={<Plus className="size-4" aria-hidden />}
                disabled={!newName.trim()}
                className="w-full md:w-auto md:px-6"
              >
                Add
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] p-6 text-center text-sm text-[var(--color-text-muted)]">
          Loading…
        </div>
      ) : wallets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
          Belum ada wallet.
        </div>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {wallets.map((w) => (
              <li
                key={w.id}
                className="flex items-center gap-3 px-5 py-4"
              >
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {w.name}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                    Saldo: {formatCurrency(w.balance)}
                  </span>
                </div>
                <ActionMenu onDelete={() => handleDelete(w.id, w.name)} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
