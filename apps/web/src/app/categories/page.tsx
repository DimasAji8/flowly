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
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ApiError } from "@/lib/api-client";
import { categoriesService } from "@/services/categories.service";
import type { Category, TransactionType } from "@/types/finance";

const DEFAULT_COLOR = "#2563EB";
const DEFAULT_ICON = "📦";
const HEX_PATTERN = /^#([0-9A-Fa-f]{6})$/;

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [group, setGroup] = useState<"needs" | "wants" | "savings">("needs");
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    setError(null);
    try {
      const data = await categoriesService.list();
      setCategories(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load categories");
    }
  };

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!HEX_PATTERN.test(color)) {
      setError("Color harus hex 6 digit, contoh #15803D");
      return;
    }
    try {
      setCreating(true);
      await categoriesService.create({ name: name.trim(), type, color: color.toUpperCase(), icon, group: type === "expense" ? group : undefined });
      setName("");
      setColor(DEFAULT_COLOR);
      setIcon(DEFAULT_ICON);
      toast.success("Kategori ditambahkan");
      await reload();
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
      await reload();
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
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-2xl">
          Categories
        </h1>
      </header>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-3 py-2.5 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Form add */}
      <Card padding="md">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
            Tambah kategori
          </h2>

          <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
            <Input
              label="Nama"
              placeholder="mis. Makanan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
                Jenis
              </label>
              <div role="radiogroup" aria-label="Jenis kategori" className="grid grid-cols-2 gap-1 rounded-lg bg-[var(--color-card-subtle)] p-1">
                {(["expense", "income"] as TransactionType[]).map((t) => {
                  const isActive = type === t;
                  return (
                    <button key={t} type="button" role="radio" aria-checked={isActive}
                      onClick={() => { setType(t); setIcon(EMOJI_SUGGESTIONS[t][0]); }}
                      className={["h-9 rounded-md text-xs font-medium capitalize transition-colors", isActive ? "bg-[var(--color-card)] text-[var(--color-text-primary)] shadow-[var(--shadow-card)]" : "text-[var(--color-text-secondary)]"].join(" ")}
                    >{t === "expense" ? "Pengeluaran" : "Pemasukan"}</button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cat-color" className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
                Warna
              </label>
              <div className="flex h-11 items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-card-subtle)] px-2">
                <input type="color" id="cat-color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="size-7 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="Pick color" />
                <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">{color.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Group picker — hanya untuk expense */}
          {type === "expense" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
                Grup
                <span className="ml-1 normal-case font-normal text-[var(--color-text-muted)]">— untuk insight keuangan</span>
              </label>
              <div role="radiogroup" className="grid grid-cols-3 gap-2">
                {GROUP_OPTIONS.map((g) => (
                  <button key={g.value} type="button" role="radio" aria-checked={group === g.value}
                    onClick={() => setGroup(g.value)}
                    className={["rounded-xl border px-3 py-2.5 text-left transition-colors", group === g.value ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-border-subtle)] bg-[var(--color-card-subtle)] hover:border-[var(--color-border)]"].join(" ")}
                  >
                    <p className={["text-xs font-semibold", group === g.value ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"].join(" ")}>{g.label}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
              Ikon
            </label>
            <div className="flex items-center gap-2">
              {/* Selected preview */}
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--color-accent-soft)] text-xl">
                {icon}
              </span>
              {/* Scrollable emoji grid */}
              <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1">
                {EMOJI_SUGGESTIONS[type].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setIcon(e)}
                    className={["size-9 shrink-0 rounded-xl text-lg transition-colors", icon === e ? "bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent)]" : "bg-[var(--color-card-subtle)] hover:bg-[var(--color-surface)]"].join(" ")}
                    aria-label={e}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={creating} leftIcon={<Plus className="size-4" aria-hidden />} disabled={!name.trim()}>
              Tambah kategori
            </Button>
          </div>
        </form>
      </Card>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] p-6 text-center text-sm text-[var(--color-text-muted)]">
          Loading…
        </div>
      ) : (
        <div className="flex flex-col gap-6">
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
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditColor(c.color);
    setEditIcon(c.icon);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await categoriesService.update(id, { name: editName.trim(), color: editColor, icon: editIcon });
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
        <h2 className="text-sm font-medium text-[var(--color-text-primary)]">{title}</h2>
        <Chip tone={tone} size="sm">{items.length}</Chip>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-5 text-center text-sm text-[var(--color-text-secondary)]">
          Belum ada kategori {title.toLowerCase()}.
        </div>      ) : (
        <Card padding="none">
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {items.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <li key={c.id} className="px-4 py-3">
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        {/* Icon preview + color dot */}
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl text-lg" style={{ background: editColor + "22" }}>
                          {editIcon}
                        </span>
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-card-subtle)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
                          maxLength={60}
                        />
                        <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)}
                          className="size-8 cursor-pointer rounded-lg border-0 bg-transparent p-0" aria-label="Color" />
                      </div>
                      {/* Emoji row */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {EMOJI_SUGGESTIONS[c.type].map((e) => (
                          <button key={e} type="button" onClick={() => setEditIcon(e)}
                            className={["size-8 shrink-0 rounded-lg text-base transition-colors", editIcon === e ? "bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent)]" : "bg-[var(--color-card-subtle)]"].join(" ")}
                          >{e}</button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" isLoading={saving} onClick={() => saveEdit(c.id)}>Simpan</Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>Batal</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl text-lg" style={{ background: c.color + "22" }}>
                        {c.icon}
                      </span>
                      <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">{c.name}</span>
                      <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
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
