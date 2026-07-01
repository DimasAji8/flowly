"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { savingsGoalsService } from "@/services/savings-goals.service";
import type { SavingsGoal, SavingsGoalContribution } from "@/types/finance";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateLong, formatRelativeTime } from "@/utils/format-date";

interface SavingsGoalHistoryModalProps {
  open: boolean;
  goal?: SavingsGoal;
  onClose: () => void;
}

export function SavingsGoalHistoryModal({ open, goal, onClose }: SavingsGoalHistoryModalProps) {
  const [contributions, setContributions] = useState<SavingsGoalContribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && goal) {
      let active = true;
      const fetchHistory = async () => {
        try {
          setLoading(true);
          setError(null);
          const list = await savingsGoalsService.listContributions(goal.id);
          if (active) {
            setContributions(list);
          }
        } catch (_err) {
          if (active) {
            setError("Gagal memuat riwayat setoran");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };
      void fetchHistory();
      return () => {
        active = false;
      };
    }
  }, [open, goal]);

  const title = goal ? `Riwayat setoran · ${goal.name}` : "Riwayat setoran";

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="py-6 text-center text-sm text-secondary">Memuat riwayat…</div>
        ) : error ? (
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger">
            {error}
          </div>
        ) : contributions.length === 0 ? (
          <div className="py-6 text-center text-sm text-secondary italic">
            Belum ada riwayat setoran untuk target ini.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-border-subtle bg-card-subtle px-4 py-3 text-sm text-foreground">
              <div className="flex justify-between items-center">
                <span className="text-secondary font-medium">Total Terkumpul:</span>
                <span className="font-bold text-foreground">
                  {goal ? formatCurrency(goal.currentAmount) : "Rp 0"}
                </span>
              </div>
            </div>
            <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {contributions.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between items-center py-2.5 border-b border-border-subtle last:border-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      +{formatCurrency(Number(c.amount))}
                    </span>
                    <span className="text-[11px] text-muted">
                      {formatDateLong(c.createdAt.slice(0, 10))}
                    </span>
                  </div>
                  <span className="text-xs text-secondary bg-card-subtle border border-border-subtle rounded-full px-2 py-0.5">
                    {formatRelativeTime(c.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button type="button" variant="secondary" className="w-full mt-2" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </Modal>
  );
}
