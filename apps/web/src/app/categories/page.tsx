"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
import { ApiError } from "@/lib/api-client";
import { categoriesService } from "@/services/categories.service";
import { useCategoryStore } from "@/store/categories.store";
import type { Category, TransactionType } from "@/types/finance";

const DEFAULT_ICON = "📦";

const GROUP_OPTIONS = [
  { value: "needs", label: "Needs", desc: "Kebutuhan pokok" },
  { value: "wants", label: "Wants", desc: "Lifestyle & keinginan" },
  { value: "savings", label: "Savings", desc: "Tabungan & investasi" },
] as const;

// Emoji suggestions per type
const EMOJI_SUGGESTIONS = {
  expense: [
    "🍔","🍕","🍜","🍣","🥗","☕","🧋","🍰",
    "🚗","🚌","✈️","🚂","⛽","🛵",
    "🧾","💡","💧","📱","🏠","🔧","🏥","💊",
    "🛍️","👗","👟","💄","🎁","🛒",
    "🎮","🎬","🎵","📚","🎨","🏋️","⚽","🎯",
    "💇","🐾","🌿","📦","🧹","🪴",
  ],
  income: [
    "💼","💰","💵","💳","📈","🏦","🤝",
    "🎁","🎉","🏆","⭐","✨",
    "💻","🖥️","📱","🎨","✍️","📸","🎤",
    "🏠","🚗","📦","🌐","📊",
  ],
};

export default function CategoriesPage() {
  const { categories, loading, fetch: fetchCategories } = useCategoryStore();

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [group, setGroup] = useState<"needs" | "wants" | "savings">("needs");
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState<"pick" | "form">("pick");
  const [creating, setCreating] = useState(false);

  const reload = () => {
    useCategoryStore.getState().invalidate();
    void useCategoryStore.getState().fetch();
  };

  useEffect(() => {
    void fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setCreating(true);
      await categoriesService.create({ name: name.trim(), type, icon, group: type === "expense" ? group : undefined });
      setName("");
      setIcon(DEFAULT_ICON);
      setAddOpen(false);
      setAddStep("pick");
      toast.success("Kategori ditambahkan");
      reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async (id: string, catName: string) => {
    try {
      await categoriesService.remove(id);
      toast.success(`Kategori "${catName}" dihapus`);
      setConfirmDelete(null);
      reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to delete category");
    }
  };

  const incomeCats = categories.filter((c) => c.type === "income");
  const expenseCats = categories.filter((c) => c.type === "expense");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <BackButton />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Kategori
        </h1>
        <Button size="sm" leftIcon={<Plus className="size-4" aria-hidden />} onClick={() => setAddOpen(true)} className="btn-add-category">
          Tambah
        </Button>
      </header>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-card p-6 text-center text-sm text-muted">
          Loading…
        </div>
      ) : (
        <div className="flex flex-col gap-6 category-list-container">
          <CategorySection
            title="Pengeluaran"
            tone="danger"
            items={expenseCats}
            onDelete={(id, name) => setConfirmDelete({ id, name })}
            onReload={reload}
          />
          <CategorySection
            title="Pemasukan"
            tone="success"
            items={incomeCats}
            onDelete={(id, name) => setConfirmDelete({ id, name })}
            onReload={reload}
          />
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id, confirmDelete.name)}
        title={`Hapus kategori "${confirmDelete?.name}"?`}
      />

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setAddStep("pick"); setName(""); setIcon(DEFAULT_ICON); setType("expense"); }} title={addStep === "form" ? (type === "expense" ? "Kategori Pengeluaran" : "Kategori Pemasukan") : "Tambah kategori"}>
        {addStep === "pick" ? (
          <div className="flex flex-col gap-3 py-2">
            <button type="button" onClick={() => { setType("expense"); setIcon(EMOJI_SUGGESTIONS.expense[0]); setAddStep("form"); }}
              className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-danger hover:bg-danger-soft">
              
              <div>
                <p className="text-sm font-semibold text-foreground">Pengeluaran</p>
                <p className="text-xs text-muted">Makanan, transportasi, dll.</p>
              </div>
            </button>
            <button type="button" onClick={() => { setType("income"); setIcon(EMOJI_SUGGESTIONS.income[0]); setAddStep("form"); }}
              className="flex items-center gap-4 rounded-xl border border-border-subtle bg-card-subtle px-5 py-4 text-left transition-colors hover:border-success hover:bg-success-soft">
              
              <div>
                <p className="text-sm font-semibold text-foreground">Pemasukan</p>
                <p className="text-xs text-muted">Gaji, freelance, dll.</p>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input label="Nama" placeholder="mis. Makanan" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />

            {type === "expense" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">
                  Grup <span className="ml-1 normal-case font-normal text-muted">— untuk insight keuangan</span>
                </label>
                <div role="radiogroup" className="grid grid-cols-3 gap-2">
                  {GROUP_OPTIONS.map((g) => (
                    <button key={g.value} type="button" role="radio" aria-checked={group === g.value}
                      onClick={() => setGroup(g.value)}
                      className={["rounded-xl border px-3 py-2.5 text-left transition-colors", group === g.value ? "border-accent bg-accent-soft" : "border-border-subtle bg-card-subtle hover:border-border"].join(" ")}
                    >
                      <p className={["text-xs font-semibold", group === g.value ? "text-accent" : "text-foreground"].join(" ")}>{g.label}</p>
                      <p className="text-[11px] text-muted">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Ikon</label>
              <EmojiPicker value={icon} onChange={setIcon} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={() => setAddStep("pick")} className="text-sm text-muted hover:text-foreground">← Kembali</button>
              <Button type="submit" isLoading={creating} disabled={!name.trim()}>Tambah</Button>
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
  onDelete,
  onReload,
}: {
  title: string;
  tone: "danger" | "success";
  items: Category[];
  onDelete: (id: string, name: string) => void;
  onReload: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editGroup, setEditGroup] = useState<"needs" | "wants" | "savings" | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditIcon(c.icon);
    setEditGroup(c.group);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string, type: TransactionType) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await categoriesService.update(id, {
        name: editName.trim(),
        icon: editIcon,
        group: type === "expense" ? (editGroup ?? "needs") : undefined,
      });
      toast.success("Kategori diperbarui");
      setEditingId(null);
      onReload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <Chip tone={tone} size="sm">{items.length}</Chip>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center text-sm text-secondary">
          Belum ada kategori {title.toLowerCase()}.
        </div>      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {items.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <li key={c.id} className="px-4 py-3">
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <Input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nama kategori"
                        maxLength={60}
                        label="Nama"
                      />
                      
                      {c.type === "expense" && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">
                            Grup <span className="ml-1 normal-case font-normal text-muted">— untuk insight keuangan</span>
                          </label>
                          <div role="radiogroup" className="grid grid-cols-3 gap-2">
                            {GROUP_OPTIONS.map((g) => (
                              <button key={g.value} type="button" role="radio" aria-checked={editGroup === g.value}
                                onClick={() => setEditGroup(g.value)}
                                className={["rounded-xl border px-3 py-2 text-left transition-colors", editGroup === g.value ? "border-accent bg-accent-soft" : "border-border-subtle bg-card-subtle hover:border-border"].join(" ")}
                              >
                                <p className={["text-xs font-semibold", editGroup === g.value ? "text-accent" : "text-foreground"].join(" ")}>{g.label}</p>
                                <p className="text-[10px] text-muted leading-tight">{g.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">Ikon</label>
                        <EmojiPicker value={editIcon} onChange={setEditIcon} />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button size="sm" isLoading={saving} onClick={() => saveEdit(c.id, c.type)}>Simpan</Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>Batal</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-card-subtle text-lg">
                        {c.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        {c.type === "expense" && c.group && (
                          <p className="text-[11px] text-muted">
                            {c.group === "needs" && "Needs (Kebutuhan)"}
                            {c.group === "wants" && "Wants (Keinginan)"}
                            {c.group === "savings" && "Savings (Tabungan)"}
                          </p>
                        )}
                      </div>
                      <ActionMenu
                        onEdit={() => startEdit(c)}
                        onDelete={() => onDelete(c.id, c.name)}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}
