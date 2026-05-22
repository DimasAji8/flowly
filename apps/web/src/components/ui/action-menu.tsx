"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface ActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export function ActionMenu({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Hapus",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        aria-expanded={open}
        className="grid size-8 place-items-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-card-subtle)] hover:text-[var(--color-text-primary)]"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 min-w-[140px] overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] shadow-[var(--shadow-modal)]">
          {onEdit && (
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-card-subtle)]"
            >
              <Pencil className="size-3.5 text-[var(--color-text-muted)]" aria-hidden />
              {editLabel}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-soft)]"
            >
              <Trash2 className="size-3.5" aria-hidden />
              {deleteLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
