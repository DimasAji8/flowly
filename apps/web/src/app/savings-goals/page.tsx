"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Wallet as WalletIcon } from "lucide-react";
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

type GoalStatus = "pending" | "on-track" | "completed" | "overdue" | "paused";

const STATUS_CONFIG: Record<GoalStatus, { label: string; className: string }> = {
  pending: { label: "Belum mulai", className: "bg-card-subtle text-secondary" },
  "on-track": { label: "Berjalan", className: "bg-accent-soft text-accent" },
  completed: { label: "Tercapai", className: "bg-success/15 text-success" },
  overdue: { label: "Terlambat", className: "bg-danger-soft text-danger" },
  paused: { label: "Dijeda", className: "bg-warning/15 text-warning" },
};

function getGoalStatus(goal: SavingsGoal): GoalStatus {
  const currentAmount = Number(goal.currentAmount);
  const targetAmount = Number(goal.targetAmount);
  if (currentAmount >= targetAmount) return "completed";
  if (goal.isPaused) return "paused";
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
  const [confirmDeleteGoal, setConfirmDeleteGoal] = useState<SavingsGoal | null>(null);
  const [confirmPauseGoal, setConfirmPauseGoal] = useState<SavingsGoal | null>(null);

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
    return () => { cancelled = true; };
  }, []);

  const walletNameById = useMemo(
    () => new Map(wallets.map((w) => [w.id, w.name])),
    [wallets],
  );

  const handleDelete = async (goal: SavingsGoal) => {
    try {
      await savingsGoalsService.remove(goal.id);
      toast.success(`Target "${goal.name}" dihapus`);
      setConfirmDeleteGoal(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus target");
    }
  };

  const handleTogglePause = async (goal: SavingsGoal) => {
    const next = !goal.isPaused;
    try {
      await savingsGoalsService.update(goal.id, { isPaused: next });
      toast.success(next ? `"${goal.name}" dijeda` : `"${goal.name}" dilanjutkan`);
      setConfirmPauseGoal(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal mengubah status");
    }
  };

  return (
    <div className="flex flex-col gap-5 flowly-enter">
      <BackButton />

      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Target Tabungan
        </h1>
        <Button
          size="sm"
          leftIcon={<Plus className="size-4" aria-hidden />}
          className="shrink-0"
          onClick={() => { setEditingGoal(undefined); setModalOpen(true); }}
        >
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
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-secondary">
          Belum ada target tabungan. Buat target pertama untuk mulai melacak tujuan finansial.
        </div>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {items.map((goal) => {
              const targetAmount = Number(goal.targetAmount);
              const currentAmount = Number(goal.currentAmount);
              const progress = targetAmount > 0
                ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
                : 0;
              const remaining = Math.max(targetAmount - currentAmount, 0);
              const status = getGoalStatus(goal);
              const { label, className: badgeClass } = STATUS_CONFIG[status];
              const linkedWalletName = goal.linkedWalletId
                ? walletNameById.get(goal.linkedWalletId)
                : null;

              return (
                <li key={goal.id} className="flex flex-col gap-3 px-5 py-4">
                  {/* row 1 — name + badge + action menu */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {goal.name}
                        </span>
                        <span className={["rounded-full px-2 py-0.5 text-[11px] font-medium", badgeClass].join(" ")}>
                          {label}
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                        <span>Target {formatDateLong(goal.targetDate.slice(0, 10))}</span>
                        {linkedWalletName && (
                          <>
                            <span aria-hidden>·</span>
                            <span className="flex items-center gap-1">
                              <WalletIcon className="size-3" aria-hidden />
                              {linkedWalletName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <ActionMenu
                      onEdit={() => { setEditingGoal(goal); setModalOpen(true); }}
                      onDelete={() => setConfirmDeleteGoal(goal)}
                      onTogglePause={status !== "completed"
                        ? () => setConfirmPauseGoal(goal)
                        : undefined}
                      isPaused={goal.isPaused}
                    />
                  </div>

                  {/* row 2 — progress bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">
                        {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}
                      </span>
                      <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border-subtle">
                      <div
                        className={[
                          "h-full rounded-full transition-all",
                          status === "completed" ? "bg-success"
                            : status === "overdue" ? "bg-danger"
                            : status === "paused" ? "bg-muted"
                            : status === "pending" ? "bg-border"
                            : "bg-accent",
                        ].join(" ")}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {(remaining > 0 || goal.note) && (
                      <div className="flex items-center justify-between text-xs text-muted">
                        {remaining > 0 && <span>Sisa {formatCurrency(remaining)}</span>}
                        {goal.note && <span className="truncate pl-2">{goal.note}</span>}
                      </div>
                    )}
                  </div>

                  {/* row 3 — cta (hidden if completed) */}
                  {status !== "completed" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="self-start"
                      onClick={() => setContributionGoal(goal)}
                    >
                      + Tambah setoran
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <SavingsGoalModal
        key={`${modalOpen}-${editingGoal?.id ?? "new"}`}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingGoal(undefined); }}
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

      {/* confirm delete */}
      <ConfirmModal
        open={Boolean(confirmDeleteGoal)}
        onClose={() => setConfirmDeleteGoal(null)}
        onConfirm={() => confirmDeleteGoal && handleDelete(confirmDeleteGoal)}
        title={`Hapus target "${confirmDeleteGoal?.name}"?`}
        description="Data target ini akan dihapus permanen."
        confirmLabel="Hapus"
        confirmVariant="danger"
      />

      {/* confirm pause / resume */}
      <ConfirmModal
        open={Boolean(confirmPauseGoal)}
        onClose={() => setConfirmPauseGoal(null)}
        onConfirm={() => confirmPauseGoal && handleTogglePause(confirmPauseGoal)}
        title={confirmPauseGoal?.isPaused
          ? `Aktifkan kembali "${confirmPauseGoal?.name}"?`
          : `Jeda target "${confirmPauseGoal?.name}"?`}
        description={confirmPauseGoal?.isPaused
          ? "Target akan dilanjutkan dan kembali ke status sebelumnya."
          : "Target akan dijeda sementara. Kamu bisa mengaktifkannya kembali kapan saja."}
        confirmLabel={confirmPauseGoal?.isPaused ? "Aktifkan" : "Tunda"}
        confirmVariant="primary"
      />
    </div>
  );
}
