"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Target, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { SavingsGoalContributionModal } from "@/components/savings-goals/savings-goal-contribution-modal";
import { ActionMenu } from "@/components/ui/action-menu";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { SavingsGoalModal } from "@/components/savings-goals/savings-goal-modal";
import { ApiError } from "@/lib/api-client";
import { savingsGoalsService } from "@/services/savings-goals.service";
import { walletsService } from "@/services/wallets.service";
import type { SavingsGoal, Wallet } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateLong } from "@/utils/format-date";

type GoalStatus = "pending" | "on-track" | "completed" | "overdue";

const STATUS_CONFIG: Record<GoalStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-card-subtle text-secondary" },
  "on-track": { label: "On target", className: "bg-accent-soft text-accent" },
  completed: { label: "Tercapai", className: "bg-success/15 text-success" },
  overdue: { label: "Terlambat", className: "bg-danger-soft text-danger" },
};

function getGoalStatus(goal: SavingsGoal): GoalStatus {
  const currentAmount = Number(goal.currentAmount);
  const targetAmount = Number(goal.targetAmount);
  if (currentAmount >= targetAmount) return "completed";
  if (currentAmount <= 0) return "pending";

  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (targetDate < today) return "overdue";

  return "on-track";
}

export default function SavingsGoalsPage() {
  const [items, setItems] = useState<SavingsGoal[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();
  const [contributionGoal, setContributionGoal] = useState<SavingsGoal | undefined>();
  const [confirmGoal, setConfirmGoal] = useState<SavingsGoal | null>(null);

  const reload = async () => {
    try {
      const [goals, walletList] = await Promise.all([
        savingsGoalsService.list(),
        walletsService.list(),
      ]);
      setItems(goals);
      setWallets(walletList);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat target tabungan");
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchInitial() {
      try {
        const [goals, walletList] = await Promise.all([
          savingsGoalsService.list(),
          walletsService.list(),
        ]);
        if (!cancelled) {
          setItems(goals);
          setWallets(walletList);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Gagal memuat target tabungan");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const walletNameById = useMemo(
    () => new Map(wallets.map((wallet) => [wallet.id, wallet.name])),
    [wallets],
  );

  const totalTarget = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.targetAmount), 0),
    [items],
  );

  const totalCurrent = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.currentAmount), 0),
    [items],
  );

  const completedCount = useMemo(
    () => items.filter((item) => getGoalStatus(item) === "completed").length,
    [items],
  );

  const handleDelete = async (goal: SavingsGoal) => {
    try {
      await savingsGoalsService.remove(goal.id);
      toast.success(`Target "${goal.name}" dihapus`);
      setConfirmGoal(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus target");
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <BackButton />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Target Tabungan
          </h1>
          <p className="mt-1 text-sm text-muted">
            Pantau progress tujuan menabung secara terpisah dari kategori dan dompet.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="size-4" aria-hidden />} onClick={() => { setEditingGoal(undefined); setModalOpen(true); }}>
          Tambah
        </Button>
      </header>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Target</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(totalTarget)}</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Terkumpul</p>
            <p className="mt-1 text-sm font-semibold text-accent">{formatCurrency(totalCurrent)}</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Selesai</p>
            <p className="mt-1 text-sm font-semibold text-success">{completedCount}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-card p-6 text-center text-sm text-muted">
          Memuat…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-secondary">
          Belum ada target tabungan. Buat target pertama untuk mulai melacak tujuan finansial.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-4">
            {items.map((goal) => {
              const targetAmount = Number(goal.targetAmount);
              const currentAmount = Number(goal.currentAmount);
              const progress = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;
              const remaining = Math.max(targetAmount - currentAmount, 0);
              const status = getGoalStatus(goal);
              const statusConfig = STATUS_CONFIG[status];
              const linkedWalletName = goal.linkedWalletId
                ? walletNameById.get(goal.linkedWalletId)
                : null;

              return (
                <li key={goal.id} className="rounded-2xl border border-border-subtle bg-card px-5 py-4" style={{ boxShadow: "var(--shadow-card-emphasis)" }}>
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                      <Target className="size-5" aria-hidden />
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {goal.name}
                            </span>
                            <span className={["rounded-full px-2 py-1 text-[11px] font-medium", statusConfig.className].join(" ")}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            Target {formatDateLong(goal.targetDate.slice(0, 10))}
                          </p>
                          {linkedWalletName && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                              <WalletIcon className="size-3.5" aria-hidden />
                              {linkedWalletName}
                            </div>
                          )}
                        </div>

                        <ActionMenu
                          onEdit={() => {
                            setEditingGoal(goal);
                            setModalOpen(true);
                          }}
                          onDelete={() => setConfirmGoal(goal)}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted">
                            {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}
                          </span>
                          <span className="rounded-full bg-card-subtle px-2 py-1 font-medium text-foreground">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
                          <div
                            className={[
                              "h-full rounded-full transition-all",
                              status === "completed"
                                ? "bg-success"
                                : status === "overdue"
                                  ? "bg-danger"
                                  : status === "pending"
                                    ? "bg-muted"
                                    : "bg-accent",
                            ].join(" ")}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted">Sisa {formatCurrency(remaining)}</span>
                          {goal.note && <span className="truncate text-muted">{goal.note}</span>}
                        </div>
                        <div className="pt-1">
                          <Button type="button" size="sm" className="w-full" onClick={() => setContributionGoal(goal)}>
                            Tambah setoran
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <SavingsGoalModal
        key={`${modalOpen}-${editingGoal?.id ?? "new"}`}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGoal(undefined);
        }}
        onSuccess={reload}
        wallets={wallets}
        goal={editingGoal}
      />

      <SavingsGoalContributionModal
        open={Boolean(contributionGoal)}
        goal={contributionGoal}
        onClose={() => setContributionGoal(undefined)}
        onSuccess={reload}
      />

      <ConfirmModal
        open={Boolean(confirmGoal)}
        onClose={() => setConfirmGoal(null)}
        onConfirm={() => confirmGoal && handleDelete(confirmGoal)}
        title={`Hapus target "${confirmGoal?.name}"?`}
      />
    </div>
  );
}