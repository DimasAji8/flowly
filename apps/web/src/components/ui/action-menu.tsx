"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MoreVertical, Pause, Pencil, Play, Trash2 } from "lucide-react";

interface ActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onTransfer?: () => void;
  onTogglePause?: () => void;
  isPaused?: boolean;
  editLabel?: string;
  deleteLabel?: string;
  transferLabel?: string;
}

export function ActionMenu({
  onEdit,
  onDelete,
  onTransfer,
  onTogglePause,
  isPaused = false,
  editLabel = "Edit",
  deleteLabel = "Hapus",
  transferLabel = "Transfer",
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
    // isolation:isolate creates a new stacking context so the dropdown
    // is always painted above sibling elements regardless of their z-index
    <div ref={ref} className="relative isolate">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        aria-expanded={open}
        className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-card-subtle hover:text-foreground"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-100 mt-1 w-44 overflow-hidden rounded-xl border border-border-subtle bg-card shadow-lg">
          {onEdit && (
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-card-subtle"
            >
              <Pencil className="size-3.5 text-muted" aria-hidden />
              {editLabel}
            </button>
          )}
          {onTransfer && (
            <button
              type="button"
              onClick={() => { setOpen(false); onTransfer(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-card-subtle"
            >
              <ArrowRight className="size-3.5 text-muted" aria-hidden />
              {transferLabel}
            </button>
          )}
          {onTogglePause && (
            <button
              type="button"
              onClick={() => { setOpen(false); onTogglePause(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-card-subtle"
            >
              {isPaused
                ? <Play className="size-3.5 text-muted" aria-hidden />
                : <Pause className="size-3.5 text-muted" aria-hidden />}
              {isPaused ? "Aktifkan" : "Tunda"}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger-soft"
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
