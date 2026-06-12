"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWorkspaceStore } from "@/store/workspace.store";
import { workspaceService } from "@/services/workspace.service";

export default function AllocationPage() {
  const router = useRouter();
  const { targets, fetch: fetchTargets, invalidate } = useWorkspaceStore();

  const [needs, setNeeds] = useState(targets.needsTarget);
  const [wants, setWants] = useState(targets.wantsTarget);
  const [savings, setSavings] = useState(targets.savingsTarget);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void fetchTargets(); }, [fetchTargets]);

  useEffect(() => {
    // setState di effect disengaja: sinkronkan input lokal dari target store saat berubah.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNeeds(targets.needsTarget);
    setWants(targets.wantsTarget);
    setSavings(targets.savingsTarget);
  }, [targets]);

  const handleChange = (field: "needs" | "wants" | "savings", newVal: number) => {
    const current = { needs, wants, savings };
    const others = (["needs", "wants", "savings"] as const).filter((f) => f !== field);
    const otherSum = others.reduce((s, f) => s + current[f], 0);
    const remaining = 100 - newVal;
    const next = { ...current, [field]: newVal };

    if (remaining < 0) {
      next[field] = 100;
      others.forEach((f) => { next[f] = 0; });
    } else if (otherSum > 0) {
      let distributed = 0;
      for (let i = 0; i < others.length - 1; i++) {
        const f = others[i];
        next[f] = Math.max(0, Math.round((current[f] / otherSum) * remaining));
        distributed += next[f];
      }
      next[others[others.length - 1]] = Math.max(0, remaining - distributed);
    } else {
      next[others[0]] = Math.floor(remaining / 2);
      next[others[1]] = remaining - next[others[0]];
    }

    setNeeds(next.needs);
    setWants(next.wants);
    setSavings(next.savings);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await workspaceService.updateAllocation({ needsTarget: needs, wantsTarget: wants, savingsTarget: savings });
      invalidate();
      void fetchTargets();
      toast.success("Target alokasi disimpan");
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const total = needs + wants + savings;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Target Alokasi
        </h1>
      </div>

      <p className="text-sm text-secondary -mt-3">
        Atur berapa persen pendapatanmu yang idealnya dialokasikan untuk masing-masing kelompok.
        Total harus 100%.
      </p>

      <Card padding="none">
        <div className="flex flex-col divide-y divide-border-subtle">
          {([
            { label: "Kebutuhan", hint: "maks.", field: "needs" as const,   value: needs,   desc: "Sandang, pangan, papan, tagihan rutin" },
            { label: "Keinginan", hint: "maks.", field: "wants" as const,   value: wants,   desc: "Hiburan, makan di luar, belanja lifestyle" },
            { label: "Tabungan",  hint: "min.",  field: "savings" as const, value: savings, desc: "Tabungan, investasi, dana darurat" },
          ]).map(({ label, hint, field, value, desc }) => (
            <div key={field} className="flex flex-col gap-2 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="text-xs text-muted">{desc}</span>
                </div>
                <span className="text-sm tabular-nums font-semibold text-accent shrink-0 ml-4">
                  {hint} {value}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={value}
                onChange={(e) => handleChange(field, Number(e.target.value))}
                className="w-full accent-accent h-1.5 cursor-pointer rounded-full appearance-none bg-border-subtle"
              />
              <div className="flex justify-between text-[11px] text-muted">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs text-muted">
              Total:{" "}
              <span className={total === 100 ? "text-success font-medium" : "text-danger font-medium"}>
                {total}%
              </span>
            </span>
            <Button onClick={handleSave} isLoading={saving} disabled={total !== 100}>
              Simpan
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
