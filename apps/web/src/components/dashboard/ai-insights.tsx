"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { aiService, type FinancialInsight } from "@/services/ai.service";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const DISMISS_KEY = "temankas:dismissed-insights";

export function AiInsights() {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // Muat dismissed ID dari localStorage
    const saved = localStorage.getItem(DISMISS_KEY);
    if (saved) {
      try {
        setDismissed(JSON.parse(saved));
      } catch {
        // Abaikan jika error
      }
    }

    aiService
      .getInsights()
      .then((data) => {
        if (Array.isArray(data)) {
          setInsights(data);
        }
      })
      .catch(() => {
        // Abaikan error agar tidak merusak UI
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDismiss = (id: string) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(updated));
  };

  const activeInsights = insights.filter((item) => !dismissed.includes(item.id));

  if (loading) {
    return <Skeleton className="h-28 rounded-2xl w-full" />;
  }

  if (activeInsights.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 flowly-enter">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary">
          Analisis Keuangan AI
        </span>
      </div>

      {activeInsights.length === 1 ? (
        <InsightCard insight={activeInsights[0]} onDismiss={handleDismiss} />
      ) : (
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="-ml-3">
            {activeInsights.map((insight) => (
              <CarouselItem key={insight.id} className="pl-3 basis-full sm:basis-1/2">
                <InsightCard insight={insight} onDismiss={handleDismiss} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
}

interface InsightCardProps {
  insight: FinancialInsight;
  onDismiss: (id: string) => void;
}

function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const { type, title, description, actionLabel, actionUrl } = insight;

  const typeConfig = {
    warning: {
      border: "border-amber-500/20 dark:border-amber-500/30",
      bg: "bg-amber-50/50 dark:bg-amber-950/10",
      icon: <AlertTriangle className="size-5 text-amber-600 shrink-0" strokeWidth={1.5} />,
    },
    success: {
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      bg: "bg-emerald-50/50 dark:bg-emerald-950/10",
      icon: <CheckCircle2 className="size-5 text-emerald-600 shrink-0" strokeWidth={1.5} />,
    },
    info: {
      border: "border-blue-500/20 dark:border-blue-500/30",
      bg: "bg-blue-50/50 dark:bg-blue-950/10",
      icon: <Info className="size-5 text-blue-600 shrink-0" strokeWidth={1.5} />,
    },
  }[type] || {
    border: "border-border-subtle",
    bg: "bg-card-subtle",
    icon: <Info className="size-5 text-secondary shrink-0" strokeWidth={1.5} />,
  };

  return (
    <div
      className={cn(
        "relative flex gap-3.5 rounded-2xl border p-4 transition-all duration-300",
        typeConfig.border,
        typeConfig.bg
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {typeConfig.icon}
      
      <div className="flex-1 pr-6">
        <h4 className="text-sm font-semibold text-foreground leading-tight">
          {title}
        </h4>
        <p className="text-xs text-secondary mt-1.5 leading-relaxed">
          {description}
        </p>

        {actionLabel && actionUrl && (
          <Link
            href={actionUrl}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline mt-2.5"
          >
            {actionLabel} &rarr;
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(insight.id)}
        className="absolute top-3.5 right-3.5 rounded-full p-1 text-muted hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5 transition-colors"
        aria-label="Tutup saran"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
