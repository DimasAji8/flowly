"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ApiError } from "@/lib/api-client";
import { budgetsService, type BudgetSummaryItem } from "@/services/budgets.service";
import { useCategoryStore } from "@/store/categories.store";
import { formatCurrency, formatAmount } from "@/utils/format-currency";
import { formatMonthYear } from "@/utils/format-date";

export default function BudgetsPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [items, setItems] = useState<BudgetSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { categories, fetch: fetchCategories } = useCategoryStore();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetSummaryItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BudgetSummaryItem | null>(null);

  // Tab Filter
  const [activeTab, setActiveTab] = useState<"all" | "budgeted" | "unbudgeted">("all");

  const period = useMemo(() => {
    return `${year}-${String(month).padStart(2, "0")}`;
  }, [year, month]);

  // Load Categories
  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Fetch Budget Summaries
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    budgetsService
      .getSummary(period)
      .then((res) => {
        if (!cancelled) {
          setItems(res);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Gagal memuat data anggaran");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period, reloadKey]);

  // Month navigation
  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // Calculations for overall header card
  const totalSummary = useMemo(() => {
    let totalLimit = 0;
    let totalSpent = 0;
    let budgetedCount = 0;

    items.forEach((item) => {
      if (item.limit !== null) {
        totalLimit += item.limit;
        totalSpent += item.spent;
        budgetedCount++;
      }
    });

    const remaining = totalLimit - totalSpent;
    const progress = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;

    return {
      totalLimit,
      totalSpent,
      remaining,
      progress,
      budgetedCount,
    };
  }, [items]);

  // Filtered Items for List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === "budgeted") return item.limit !== null;
      if (activeTab === "unbudgeted") return item.limit === null;
      return true;
    });
  }, [items, activeTab]);

  // Open Modal for Add
  const handleAddBudget = () => {
    setEditingItem(null);
    const unbudgetedCats = items.filter((i) => i.limit === null);
    if (unbudgetedCats.length > 0) {
      setSelectedCategoryId(unbudgetedCats[0].categoryId);
    } else {
      setSelectedCategoryId("");
    }
    setAmountInput("");
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleEditBudget = (item: BudgetSummaryItem) => {
    setEditingItem(item);
    setSelectedCategoryId(item.categoryId);
    setAmountInput(String(item.limit || ""));
    setModalOpen(true);
  };

  // Submit Add/Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      toast.error("Silakan pilih kategori");
      return;
    }
    const amt = Number(amountInput.replace(/\D/g, ""));
    if (isNaN(amt) || amt <= 0) {
      toast.error("Nominal anggaran harus lebih dari 0");
      return;
    }

    try {
      setSubmitting(true);
      await budgetsService.upsert({
        categoryId: selectedCategoryId,
        amount: amt,
        period,
      });
      toast.success(
        editingItem ? "Anggaran berhasil diperbarui" : "Anggaran berhasil ditambahkan"
      );
      setModalOpen(false);
      setReloadKey((k) => k + 1);
      // Dispatch custom event to tell other components to reload if necessary
      window.dispatchEvent(new CustomEvent("flowly:transaction-added"));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan anggaran");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!confirmDelete || !confirmDelete.id) return;
    try {
      await budgetsService.remove(confirmDelete.id);
      toast.success("Anggaran berhasil dihapus");
      setConfirmDelete(null);
      setReloadKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent("flowly:transaction-added"));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus anggaran");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl pb-10">
      <BackButton />

      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Anggaran Bulanan
        </h1>
        <Button
          size="sm"
          onClick={handleAddBudget}
          disabled={items.filter((i) => i.limit === null).length === 0}
          leftIcon={<Plus className="size-4" aria-hidden />}
        >
          Set Anggaran
        </Button>
      </header>

      {/* ── Month Selector ── */}
      <div className="flex items-center justify-between rounded-xl bg-card border border-border-subtle p-2">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-card-subtle text-muted hover:text-foreground rounded-lg transition-colors"
          aria-label="Bulan Sebelumnya"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-semibold text-sm text-foreground md:text-base">
          {formatMonthYear(year, month)}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-card-subtle text-muted hover:text-foreground rounded-lg transition-colors"
          aria-label="Bulan Berikutnya"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft p-4 flex items-center gap-3 text-sm text-danger">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Total Summary Card ── */}
      {!loading && totalSummary.totalLimit > 0 && (
        <Card className="flex flex-col gap-4 bg-accent-soft/20 border-accent/20">
          <div className="grid grid-cols-3 gap-2 text-center divide-x divide-border-subtle">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">Total Anggaran</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(totalSummary.totalLimit)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">Terpakai</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(totalSummary.totalSpent)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">Sisa</span>
              <span
                className={[
                  "text-sm font-semibold tabular-nums",
                  totalSummary.remaining < 0 ? "text-danger" : "text-success",
                ].join(" ")}
              >
                {formatCurrency(totalSummary.remaining)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-full bg-border rounded-full overflow-hidden">
              <div
                className={[
                  "h-full rounded-full transition-all duration-500",
                  totalSummary.progress >= 100
                    ? "bg-danger"
                    : totalSummary.progress >= 80
                    ? "bg-warning"
                    : "bg-accent",
                ].join(" ")}
                style={{ width: `${totalSummary.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Efisiensi anggaran bulan ini</span>
              <span className="font-semibold text-foreground">{totalSummary.progress}%</span>
            </div>
          </div>
        </Card>
      )}

      {/* ── Tab Filter ── */}
      <div className="flex gap-1 border-b border-border-subtle pb-1">
        {(
          [
            { key: "all", label: "Semua Kategori" },
            { key: "budgeted", label: "Aktif" },
            { key: "unbudgeted", label: "Belum Diatur" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={[
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border border-transparent",
              activeTab === t.key
                ? "bg-card border-border-subtle text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Budgets List ── */}
      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-card p-10 text-center text-sm text-muted">
          Memuat data anggaran…
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
          Tidak ada anggaran dalam kategori ini.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredItems.map((item) => {
            const hasLimit = item.limit !== null;
            const progress = hasLimit ? Math.min(100, Math.round((item.spent / item.limit!) * 100)) : 0;
            const overLimit = hasLimit && item.spent > item.limit!;
            const nearLimit = hasLimit && item.spent >= item.limit! * 0.8 && !overLimit;

            // Track/Fill colors
            const trackColor = overLimit
              ? "bg-danger/10"
              : nearLimit
              ? "bg-warning/10"
              : "bg-success/10";

            const fillColor = overLimit
              ? "bg-danger"
              : nearLimit
              ? "bg-warning"
              : "bg-success";

            return (
              <Card key={item.categoryId} padding="md" className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-base"
                      style={{ backgroundColor: `${item.categoryColor}15` }}
                    >
                      {item.categoryIcon}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {item.categoryName}
                      </span>
                      {item.categoryGroup && (
                        <span className="text-[10px] text-muted uppercase tracking-wider">
                          {item.categoryGroup}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasLimit ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold tabular-nums text-foreground">
                          Rp {formatAmount(item.spent)}
                        </span>
                        <span className="text-[10px] text-muted tabular-nums">
                          dari Rp {formatAmount(item.limit!)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-muted">Belum diatur</span>
                    )}

                    <div className="flex gap-1 ml-1">
                      {hasLimit ? (
                        <>
                          <button
                            onClick={() => handleEditBudget(item)}
                            className="p-1.5 hover:bg-card-subtle text-muted hover:text-foreground rounded-md transition-colors"
                            aria-label="Edit Anggaran"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(item)}
                            className="p-1.5 hover:bg-card-subtle text-muted hover:text-danger rounded-md transition-colors"
                            aria-label="Hapus Anggaran"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingItem(null);
                            setSelectedCategoryId(item.categoryId);
                            setAmountInput("");
                            setModalOpen(true);
                          }}
                          className="h-7 text-[10px] px-2"
                        >
                          Atur
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {hasLimit && (
                  <div className="flex flex-col gap-1">
                    <div className={["h-1.5 w-full overflow-hidden rounded-full", trackColor].join(" ")}>
                      <div
                        className={["h-full rounded-full transition-all duration-500", fillColor].join(" ")}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted">
                      {overLimit ? (
                        <span className="text-danger font-medium flex items-center gap-1">
                          <AlertCircle className="size-3 shrink-0" />
                          Melebihi budget Rp {formatAmount(item.spent - item.limit!)}
                        </span>
                      ) : (
                        <span>Sisa budget: Rp {formatAmount(item.limit! - item.spent)}</span>
                      )}
                      <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Budget Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Anggaran" : "Atur Anggaran Baru"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {editingItem ? (
            <div className="flex items-center gap-2 bg-card-subtle px-3 py-2.5 rounded-lg border border-border-subtle">
              <span className="text-lg">{editingItem.categoryIcon}</span>
              <span className="text-sm font-semibold text-foreground">
                {editingItem.categoryName}
              </span>
              <span className="text-xs text-muted ml-auto">Kategori</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">
                Pilih Kategori
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="h-11 px-3 bg-card-subtle border border-border-subtle rounded-lg text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-[var(--color-accent-soft)] outline-none"
              >
                {items
                  .filter((item) => item.limit === null)
                  .map((item) => (
                    <option key={item.categoryId} value={item.categoryId}>
                      {item.categoryIcon} {item.categoryName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <Input
            label="Target Anggaran per Bulan"
            placeholder="0"
            type="text"
            inputMode="numeric"
            leftAdornment="Rp"
            value={amountInput ? formatAmount(Number(amountInput.replace(/\D/g, ""))) : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setAmountInput(raw);
            }}
          />

          <div className="flex gap-3 justify-end mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="flex-1 lg:flex-none"
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              className="flex-1 lg:flex-none lg:px-8"
            >
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Confirm Delete Modal ── */}
      <ConfirmModal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Hapus anggaran?"
        description={`Target anggaran untuk kategori ${confirmDelete?.categoryName} pada bulan ini akan dihapus. Riwayat transaksi pengeluaran tidak akan terpengaruh.`}
      />
    </div>
  );
}
