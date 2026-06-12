"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterOption = { label: string; value: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnChange = (v: any) => void;

type ChipFilter   = { type: "chip";     label: string; options: FilterOption[]; value: string; onChange: OnChange };
type DropdownFilter = { type: "dropdown"; label: string; options: FilterOption[]; value: string; onChange: OnChange };
export type FilterConfig = (ChipFilter | DropdownFilter) & { key: string };

export function FilterBar({ filters }: { filters: FilterConfig[] }) {
  const [open, setOpen] = useState(false);

  // draft = nilai sementara di dalam popover
  const [draft, setDraft] = useState<Record<string, string>>({});

  // sync draft saat popover dibuka
  useEffect(() => {
    if (open) {
      // setState di effect disengaja: sinkronkan draft dari props saat popover dibuka.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(Object.fromEntries(filters.map((f) => [f.key, f.value])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const activeCount = filters.filter((f) => f.value !== f.options[0]?.value).length;

  const handleApply = () => {
    filters.forEach((f) => {
      if (draft[f.key] !== f.value) f.onChange(draft[f.key]);
    });
    setOpen(false);
  };

  const handleReset = () => {
    const reset = Object.fromEntries(filters.map((f) => [f.key, f.options[0]?.value ?? ""]));
    setDraft(reset);
    filters.forEach((f) => f.onChange(f.options[0]?.value ?? ""));
  };

  const draftChanged = filters.some((f) => draft[f.key] !== f.value);
  const draftActive = filters.filter((f) => (draft[f.key] ?? f.value) !== f.options[0]?.value).length;

  return (
    <div className="flex justify-end">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              activeCount > 0
                ? "bg-accent/10 border border-accent/30 text-accent"
                : "bg-card border border-border-subtle text-secondary hover:text-foreground hover:border-border",
            ].join(" ")}
          >
            <SlidersHorizontal className="size-3.5" />
            Filter
            {activeCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] text-white leading-none">
                {activeCount}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-4 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Filter</p>
            {draftActive > 0 && (
              <button type="button" onClick={handleReset} className="text-xs text-accent hover:underline">
                Reset
              </button>
            )}
          </div>

          {/* Filter sections */}
          {filters.map((filter) => {
            const val = draft[filter.key] ?? filter.value;
            return (
              <div key={filter.key} className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{filter.label}</p>
                {filter.type === "chip" ? (
                  <div className="flex flex-wrap gap-1.5">
                    {filter.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, [filter.key]: opt.value }))}
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                          val === opt.value
                            ? "bg-accent text-white"
                            : "border border-border-subtle bg-card-subtle text-secondary hover:text-foreground",
                        ].join(" ")}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg border border-border-subtle bg-card-subtle px-3 py-2.5 text-sm text-foreground hover:bg-card focus:outline-none"
                      >
                        <span>{filter.options.find((o) => o.value === val)?.label}</span>
                        <ChevronDown className="size-4 text-muted" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      {filter.options.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onSelect={() => setDraft((d) => ({ ...d, [filter.key]: opt.value }))}
                          className="flex items-center justify-between gap-3"
                        >
                          <span>{opt.label}</span>
                          {val === opt.value && <Check className="size-3.5 shrink-0 text-accent" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div className="flex gap-2 pt-1 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-border-subtle bg-card-subtle py-2 text-xs font-semibold text-secondary hover:text-foreground transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!draftChanged}
              className="flex-1 rounded-lg bg-accent py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
            >
              Terapkan
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
