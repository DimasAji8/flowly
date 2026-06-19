"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { SavingsGoalContributionModal } from "@/components/savings-goals/savings-goal-contribution-modal";
import { ActionMenu } from "@/components/ui/action-menu";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { FilterBar } from "@/components/ui/filter-bar";
import { SavingsGoalModal } from "@/components/savings-goals/savings-goal-modal";
import { ApiError } from "@/lib/api-client";
import { savingsGoalsService } from "@/services/savings-goals.service";
import { useWalletStore } from "@/store/wallets.store";
import type { SavingsGoal } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateLong } from "@/utils/format-date";

type GoalStatus = "pending" | "on-track" | "completed" | "overdue" | "paused";

const STATUS_CONFIG: Record<
  GoalStatus,
  { label: string; badge: string; track: string; fill: string }
> = {
  pending:    { label: "Belum mulai", badge: "bg-card-subtle text-secondary",   track: "bg-border-subtle",  fill: "bg-muted"    },
  "on-track": { label: "Berjalan",    badge: "bg-accent-soft text-accent",      track: "bg-accent/15",      fill: "bg-accent"   },
  completed:  { label: "Tercapai",    badge: "bg-success/15 text-success",      track: "bg-success/15",     fill: "bg-success"  },
  overdue:    { label: "Terlambat",   badge: "bg-danger-soft text-danger",      track: "bg-danger/15",      fill: "bg-danger"   },
  paused:     { label: "Dijeda",      badge: "bg-warning/15 text-warning",      track: "bg-warning/15",     fill: "bg-warning"  },
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

type GoalFilter = "active" | "completed" | "paused" | "all";

const GOAL_FILTER_OPTIONS = [
  { label: "Semua", value: "all" as const },
  { label: "Aktif", value: "active" as const },
  { label: "Tercapai", value: "completed" as const },
  { label: "Dijeda", value: "paused" as const },
];

export default function SavingsGoalsPage() {
  const [items, setItems] = useState<SavingsGoal[]>([]);
  const { wallets, fetch: fetchWallets } = useWalletStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<GoalFilter>("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();
  const [contributionGoal, setContributionGoal] = useState<SavingsGoal | undefined>();
  const [confirmDeleteGoal, setConfirmDeleteGoal] = useState<SavingsGoal | null>(null);
  const [confirmPauseGoal, setConfirmPauseGoal] = useState<SavingsGoal | null>(null);

  const reload = async () => {
    try {
      const goals = await savingsGoalsService.list();
      setItems(goals);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat target tabungan");
    }
  };

  useEffect(() => {
    let cancelled = false;    async function fetchInitial() {
      try {
        const [goals] = await Promise.all([
          savingsGoalsService.list(),
          fetchWallets(),
        ]);
        if (!cancelled) { setItems(goals); setError(null); }
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Gagal memuat target tabungan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInitial();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh data saat transaksi ditambah/diubah/dihapus dari halaman lain
  useEffect(() => {
    const handler = () => {
      useWalletStore.getState().invalidate();
      void reload();
    };
    window.addEventListener("flowly:transaction-added", handler);
    return () => window.removeEventListener("flowly:transaction-added", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const walletNameById = useMemo(
    () => new Map(wallets.map((w) => [w.id, w.name])),
    [wallets],
  );

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((g) => {
      const completed = Number(g.currentAmount) >= Number(g.targetAmount);
      if (statusFilter === "completed") return completed;
      if (statusFilter === "paused") return !completed && g.isPaused;
      // "active" = belum selesai & tidak dijeda
      return !completed && !g.isPaused;
    });
  }, [items, statusFilter]);

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

      <FilterBar filters={[{
        key: "status", type: "chip", label: "Status",
        options: GOAL_FILTER_OPTIONS,
        value: statusFilter,
        onChange: setStatusFilter,
      }]} />

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-card p-6 text-center text-sm text-muted">
          Memuat…
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-secondary">
          {statusFilter === "all" ? "Belum ada target tabungan. Buat target pertama untuk mulai melacak tujuan finansial." : "Tidak ada target yang cocok dengan filter ini."}
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {filteredItems.map((goal) => {
            const targetAmount = Number(goal.targetAmount);
            const currentAmount = Number(goal.currentAmount);
            const progress = targetAmount > 0
              ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
              : 0;
            const remaining = Math.max(targetAmount - currentAmount, 0);
            const status = getGoalStatus(goal);
            const cfg = STATUS_CONFIG[status];
            const linkedWalletName = goal.linkedWalletId
              ? walletNameById.get(goal.linkedWalletId)
              : null;

            return (
              <li
                key={goal.id}
                className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-card p-4"
                style={{ boxShadow: "var(--shadow-card-emphasis)" }}
              >
                {/* ── top row: name / meta / menu ── */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground leading-tight">
                        {goal.name}
                      </h3>
                      <span className={["rounded-full px-2 py-0.5 text-[11px] font-semibold", cfg.badge].join(" ")}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
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
                    onTogglePause={status !== "completed" ? () => setConfirmPauseGoal(goal) : undefined}
                    isPaused={goal.isPaused}
                  />
                </div>

                {/* ── amounts + progress ── */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-base font-semibold tabular-nums text-foreground">
                      {formatCurrency(currentAmount)}
                    </span>
                    <span className="text-xs tabular-nums text-muted">
                      / {formatCurrency(targetAmount)}
                    </span>
                  </div>
                  <div className={["h-2 w-full overflow-hidden rounded-full", cfg.track].join(" ")}>
                    <div
                      className={["h-full rounded-full transition-all duration-500", cfg.fill].join(" ")}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    {remaining > 0 ? (
                      <span>
                        Sisa {formatCurrency(remaining)}
                        {goal.note ? ` · ${goal.note}` : ""}
                      </span>
                    ) : (
                      <span className="font-medium text-success">Target tercapai</span>
                    )}
                    <span className="font-medium text-foreground">{progress}%</span>
                  </div>
                </div>

                {/* ── CTA ── */}
                {status !== "completed" && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setContributionGoal(goal)}
                    >
                       Tambah Setoran
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
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

      <ConfirmModal
        open={Boolean(confirmDeleteGoal)}
        onClose={() => setConfirmDeleteGoal(null)}
        onConfirm={() => confirmDeleteGoal && handleDelete(confirmDeleteGoal)}
        title={`Hapus target "${confirmDeleteGoal?.name}"?`}
        description="Data target ini akan dihapus permanen."
        confirmLabel="Hapus"
        confirmVariant="danger"
      />

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
