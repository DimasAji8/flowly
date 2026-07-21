"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Edit2, Trash2, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { BackButton } from "@/components/ui/back-button";
import { ActionMenu } from "@/components/ui/action-menu";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiError } from "@/lib/api-client";
import { categoriesService } from "@/services/categories.service";
import { budgetsService } from "@/services/budgets.service";
import { useCategoryStore } from "@/store/categories.store";
import type { Category, TransactionType } from "@/types/finance";
import { formatCurrency, formatAmount } from "@/utils/format-currency";
import { formatMonthYear } from "@/utils/format-date";

const DEFAULT_ICON = "📦";

const GROUP_OPTIONS = [
  { value: "needs", label: "Needs", desc: "Kebutuhan pokok" },
  { value: "wants", label: "Wants", desc: "Lifestyle & keinginan" },
  { value: "savings", label: "Savings", desc: "Tabungan & investasi" },
] as const;

export default function CategoriesPage() {
  const { categories, loading, fetch: fetchCategories } = useCategoryStore();
  const [budgets, setBudgets] = useState<any[]>([]);

  const today = new Date();
  const currentPeriod = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthName = formatMonthYear(today.getFullYear(), today.getMonth() + 1);

  // Add Category State
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState<"pick" | "form">("pick");
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [group, setGroup] = useState<"needs" | "wants" | "savings">("needs");
  const [budgetInput, setBudgetInput] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit Category State
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editGroup, setEditGroup] = useState<"needs" | "wants" | "savings">("needs");
  const [editBudgetInput, setEditBudgetInput] = useState("");
  const [editBudgetId, setEditBudgetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const loadData = async () => {
    useCategoryStore.getState().invalidate();
    await fetchCategories();
    try {
      const bRes = await budgetsService.getSummary(currentPeriod);
      setBudgets(bRes);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setCreating(true);
      // 1. Create Category
      const newCat = await categoriesService.create({
        name: name.trim(),
        type,
        icon,
        group: type === "expense" ? group : undefined,
      });

      // 2. Set Budget (if expense and budget nominal is provided)
      const budgetAmount = Number(budgetInput.replace(/\D/g, ""));
      if (type === "expense" && budgetAmount > 0) {
        await budgetsService.upsert({
          categoryId: newCat.id,
          amount: budgetAmount,
          period: currentPeriod,
        });
      }

      toast.success("Kategori berhasil ditambahkan");
      setName("");
      setIcon(DEFAULT_ICON);
      setBudgetInput("");
      setAddOpen(false);
      setAddStep("pick");
      void loadData();
      window.dispatchEvent(new CustomEvent("flowly:transaction-added"));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menambahkan kategori");
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (c: Category) => {
    const matchedBudget = budgets.find((b) => b.categoryId === c.id);
    setEditingCategory(c);
    setEditName(c.name);
    setEditIcon(c.icon);
    setEditGroup(c.group || "needs");
    setEditBudgetInput(matchedBudget?.limit ? String(matchedBudget.limit) : "");
    setEditBudgetId(matchedBudget?.id || null);
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    try {
      setSaving(true);
      // 1. Update Category
      await categoriesService.update(editingCategory.id, {
        name: editName.trim(),
        icon: editIcon,
        group: editingCategory.type === "expense" ? editGroup : undefined,
      });

      // 2. Update Budget
      if (editingCategory.type === "expense") {
        const newBudgetAmount = Number(editBudgetInput.replace(/\D/g, ""));
        const matchedBudget = budgets.find((b) => b.categoryId === editingCategory.id);

        if (newBudgetAmount > 0) {
          await budgetsService.upsert({
            categoryId: editingCategory.id,
            amount: newBudgetAmount,
            period: currentPeriod,
          });
        } else if (matchedBudget?.id) {
          // Budget cleared, delete it
          await budgetsService.remove(matchedBudget.id);
        }
      }

      toast.success("Kategori berhasil diperbarui");
      setEditOpen(false);
      setEditingCategory(null);
      void loadData();
      window.dispatchEvent(new CustomEvent("flowly:transaction-added"));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan kategori");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    try {
      await categoriesService.remove(id);
      toast.success(`Kategori "${catName}" dihapus`);
      setConfirmDelete(null);
      void loadData();
      window.dispatchEvent(new CustomEvent("flowly:transaction-added"));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to delete category");
    }
  };

  const incomeCats = categories.filter((c) => c.type === "income");
  const expenseCats = categories.filter((c) => c.type === "expense");

  return (
    <div className="flex flex-col gap-6 max-w-2xl pb-10">
      <BackButton />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Kategori
        </h1>
        <Button
          size="sm"
          leftIcon={<Plus className="size-4" aria-hidden />}
          onClick={() => setAddOpen(true)}
          className="btn-add-category"
        >
          Tambah
        </Button>
      </header>

      {/* List Sections */}
      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-card p-10 text-center text-sm text-muted">
          Loading kategori…
        </div>
      ) : (
        <div className="flex flex-col gap-6 category-list-container">
          <CategorySection
            title="Pengeluaran"
            tone="danger"
            items={expenseCats}
            budgets={budgets}
            onEdit={handleStartEdit}
            onDelete={(id, name) => setConfirmDelete({ id, name })}
          />
          <CategorySection
            title="Pemasukan"
            tone="success"
            items={incomeCats}
            budgets={budgets}
            onEdit={handleStartEdit}
            onDelete={(id, name) => setConfirmDelete({ id, name })}
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id, confirmDelete.name)}
        title={`Hapus kategori "${confirmDelete?.name}"?`}
        description="Semua transaksi yang menggunakan kategori ini tidak akan memiliki kategori lagi (kategori dihapus)."
      />

      {/* Add Category Modal */}
      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setAddStep("pick");
          setName("");
          setIcon(DEFAULT_ICON);
          setType("expense");
          setBudgetInput("");
        }}
        title={
          addStep === "form"
            ? type === "expense"
              ? "Kategori Pengeluaran"
              : "Kategori Pemasukan"
            : "Tambah Kategori"
        }
      >
        {addStep === "pick" ? (
          <div className="flex flex-col gap-3 py-2">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setIcon("🍔");
                setAddStep("form");
              }}
              className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-danger hover:bg-danger-soft"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Pengeluaran</p>
                <p className="text-xs text-muted">Makanan, transportasi, belanja, dll.</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setIcon("💼");
                setAddStep("form");
              }}
              className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-success hover:bg-success-soft"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Pemasukan</p>
                <p className="text-xs text-muted">Gaji, bonus, investasi, dll.</p>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              label="Nama Kategori"
              placeholder="mis. Makanan & Minuman"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
            />

            {type === "expense" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">
                    Grup (untuk insight keuangan)
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={[
                          "flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors",
                          "bg-card-subtle text-foreground border-border-subtle hover:border-accent",
                        ].join(" ")}
                      >
                        <span>
                          {group === "needs" && "Needs (Kebutuhan Pokok)"}
                          {group === "wants" && "Wants (Lifestyle & Keinginan)"}
                          {group === "savings" && "Savings (Tabungan & Investasi)"}
                          {!group && "Pilih grup"}
                        </span>
                        <ChevronDown className="size-4 text-muted" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
                      {[
                        { value: "needs", label: "Needs (Kebutuhan Pokok)" },
                        { value: "wants", label: "Wants (Lifestyle & Keinginan)" },
                        { value: "savings", label: "Savings (Tabungan & Investasi)" },
                      ].map((item) => (
                        <DropdownMenuItem
                          key={item.value}
                          onSelect={() => setGroup(item.value as any)}
                          className="flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          {group === item.value && <Check className="size-4 text-accent" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Input
                  label="Target Anggaran Bulanan (Opsional)"
                  placeholder="0"
                  inputMode="numeric"
                  leftAdornment={<span className="font-medium text-xs">Rp</span>}
                  value={budgetInput ? formatAmount(Number(budgetInput.replace(/\D/g, ""))) : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setBudgetInput(raw);
                  }}
                  hint={`Mengatur target budget kategori ini untuk bulan ${currentMonthName}`}
                />
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Ikon</label>
              <EmojiPicker value={icon} onChange={setIcon} />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setAddStep("pick")}
                className="text-sm text-muted hover:text-foreground"
              >
                ← Kembali
              </button>
              <Button type="submit" isLoading={creating} disabled={!name.trim()}>
                Tambah
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingCategory(null);
        }}
        title={`Edit Kategori: ${editingCategory?.name || ""}`}
      >
        {editingCategory && (
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            <Input
              label="Nama Kategori"
              placeholder="Nama kategori"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={60}
              required
            />

            {editingCategory.type === "expense" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">
                    Grup (untuk insight keuangan)
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={[
                          "flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors",
                          "bg-card-subtle text-foreground border-border-subtle hover:border-accent",
                        ].join(" ")}
                      >
                        <span>
                          {editGroup === "needs" && "Needs (Kebutuhan Pokok)"}
                          {editGroup === "wants" && "Wants (Lifestyle & Keinginan)"}
                          {editGroup === "savings" && "Savings (Tabungan & Investasi)"}
                          {!editGroup && "Pilih grup"}
                        </span>
                        <ChevronDown className="size-4 text-muted" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
                      {[
                        { value: "needs", label: "Needs (Kebutuhan Pokok)" },
                        { value: "wants", label: "Wants (Lifestyle & Keinginan)" },
                        { value: "savings", label: "Savings (Tabungan & Investasi)" },
                      ].map((item) => (
                        <DropdownMenuItem
                          key={item.value}
                          onSelect={() => setEditGroup(item.value as any)}
                          className="flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          {editGroup === item.value && <Check className="size-4 text-accent" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Input
                  label="Target Anggaran Bulanan (Opsional)"
                  placeholder="0"
                  inputMode="numeric"
                  leftAdornment={<span className="font-medium text-xs">Rp</span>}
                  value={editBudgetInput ? formatAmount(Number(editBudgetInput.replace(/\D/g, ""))) : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setEditBudgetInput(raw);
                  }}
                  hint={`Mengatur target budget kategori ini untuk bulan ${currentMonthName}`}
                />
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Ikon</label>
              <EmojiPicker value={editIcon} onChange={setEditIcon} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditOpen(false);
                  setEditingCategory(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={saving} disabled={!editName.trim()}>
                Simpan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function CategorySection({
  title,
  tone,
  items,
  budgets,
  onEdit,
  onDelete,
}: {
  title: string;
  tone: "danger" | "success";
  items: Category[];
  budgets: any[];
  onEdit: (c: Category) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <Chip tone={tone} size="sm">
          {items.length}
        </Chip>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center text-sm text-secondary">
          Belum ada kategori {title.toLowerCase()}.
        </div>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {items.map((c) => {
              const matchedBudget = budgets.find((b) => b.categoryId === c.id);
              const limit = matchedBudget?.limit ? Number(matchedBudget.limit) : 0;
              const spent = matchedBudget?.spent ? Number(matchedBudget.spent) : 0;
              const isOver = limit > 0 && spent > limit;
              const isNear = limit > 0 && spent >= limit * 0.8 && spent <= limit;

              return (
                <li key={c.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-card-subtle/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      aria-hidden
                      className="grid size-9 shrink-0 place-items-center rounded-xl bg-card-subtle text-lg"
                    >
                      {c.icon}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                      {c.type === "expense" && c.group && (
                        <p className="text-[11px] text-muted">
                          {c.group === "needs" && "Needs (Kebutuhan)"}
                          {c.group === "wants" && "Wants (Keinginan)"}
                          {c.group === "savings" && "Savings (Tabungan)"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {limit > 0 && (
                      <div className="flex flex-col items-end text-right">
                        {isOver ? (
                          <>
                            <span className="text-[9px] font-bold text-danger uppercase tracking-wider">
                              Overbudget
                            </span>
                            <span className="text-xs font-bold text-danger tabular-nums mt-0.5">
                              +Rp {formatAmount(spent - limit)}
                            </span>
                          </>
                        ) : isNear ? (
                          <>
                            <span className="text-[9px] font-bold text-warning uppercase tracking-wider">
                              Hampir Habis
                            </span>
                            <span className="text-xs font-semibold text-warning tabular-nums mt-0.5">
                              Sisa Rp {formatAmount(limit - spent)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] font-semibold text-muted uppercase tracking-wider">
                              Anggaran
                            </span>
                            <span className="text-xs font-semibold text-secondary tabular-nums mt-0.5">
                              Rp {formatAmount(limit)}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    <ActionMenu onEdit={() => onEdit(c)} onDelete={() => onDelete(c.id, c.name)} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}
