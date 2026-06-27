"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  TrendingUp,
  Brain,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { aiService, type FinancialInsight } from "@/services/ai.service";
import { cn } from "@/lib/utils";

const STORAGE_LAST_RUN = "temankas:ai-last-run";

export default function AiAnalysisPage() {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const fetchInsights = useCallback(async (force = false) => {
    if (force) {
      setAnalyzing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await aiService.getInsights(force);
      if (Array.isArray(data)) {
        setInsights(data);
      }
      
      const nowStr = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      localStorage.setItem(STORAGE_LAST_RUN, nowStr);
      setLastRun(nowStr);
      
      if (force) {
        toast.success("Analisis keuangan terbaru berhasil dibuat!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat analisis AI");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_LAST_RUN);
    if (saved) {
      setLastRun(saved);
    }
    fetchInsights(false);
  }, [fetchInsights]);

  const handleStartAnalysis = () => {
    fetchInsights(true);
  };

  // Compute a financial health score based on the insights present
  const computeHealthScore = () => {
    if (loading || analyzing) return null;
    let baseScore = 95;
    
    insights.forEach((insight) => {
      if (insight.type === "warning") baseScore -= 12;
      if (insight.type === "success") baseScore += 2;
    });

    return Math.max(30, Math.min(100, baseScore));
  };

  const score = computeHealthScore();

  return (
    <div className="flex flex-col gap-6 flowly-enter pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-violet-500/10 text-violet-600 border border-violet-100/50">
            <Sparkles className="size-4.5" />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            TemanKas AI
          </h1>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Gunakan kecerdasan buatan untuk mengulas pola pengeluaran Anda, melacak target tabungan, dan mendeteksi anomali anggaran secara otomatis.
        </p>
      </div>

      {/* Hero Analysis Control Panel */}
      <div 
        className="relative overflow-hidden rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.02] via-transparent to-transparent p-5"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px -4px rgba(139,92,246,0.04)" }}
      >
        <div className="absolute -top-12 -right-12 size-32 bg-violet-500/5 blur-2xl rounded-full" />
        
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-500/10 text-violet-600">
              <Brain className={cn("size-5", analyzing && "animate-pulse")} />
            </span>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                Asisten Analisis Finansial Cerdas
              </h3>
              <p className="text-[11px] text-secondary mt-1 leading-relaxed">
                Teknologi AI kami memindai 30 hari riwayat transaksi, pembagian kategori budget (Needs, Wants, Savings), dan kesiapan alokasi dana darurat Anda.
              </p>
              {lastRun && (
                <span className="text-[9px] font-bold text-violet-600/80 uppercase tracking-wider mt-2">
                  Terakhir Diperbarui: Hari ini pukul {lastRun}
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handleStartAnalysis}
            disabled={loading || analyzing}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-10 px-4 font-bold shadow-md shadow-violet-600/10 transition-all flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Menganalisis data...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Mulai Analisis Keuangan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Skor Kesehatan Keuangan (Centered) */}
      {!loading && !analyzing && score !== null && (
        <Card 
          className="p-5 bg-card flex flex-col items-center justify-center text-center relative overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {/* Score Indicator Ring */}
          <div className="relative size-28 flex items-center justify-center mb-3">
            <svg className="size-full -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-border-subtle fill-none"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r="46"
                className={cn(
                  "fill-none transition-all duration-1000",
                  score >= 85
                    ? "stroke-emerald-500"
                    : score >= 70
                    ? "stroke-amber-500"
                    : "stroke-red-500"
                )}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={(2 * Math.PI * 46) * (1 - score / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-foreground tabular-nums leading-none">
                {score}
              </span>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider mt-1">
                Skor Anda
              </span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-foreground">
            {score >= 85
              ? "Kondisi Keuangan Sangat Prima"
              : score >= 70
              ? "Cukup Baik, Perlu Penyesuaian"
              : "Risiko Tinggi, Evaluasi Segera"}
          </h4>
          <p className="text-[11px] text-secondary mt-1.5 leading-relaxed max-w-sm">
            {score >= 85
              ? "Pola pengeluaran Anda terjaga seimbang dengan target tabungan bulanan. Teruskan pertahanan disiplin ini!"
              : score >= 70
              ? "Terdapat beberapa pengeluaran Wants yang melebihi batas atau saldo tabungan yang mulai pas-pasan."
              : "Pengeluaran melampaui pendapatan bersih atau target tabungan diabaikan secara signifikan."}
          </p>
        </Card>
      )}

      {/* Recommendations & insights list */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-secondary border-b border-border-subtle pb-2">
          Rekomendasi & Temuan ({loading || analyzing ? "..." : insights.length})
        </h2>

        {loading || analyzing ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 rounded-2xl w-full" />
            <Skeleton className="h-24 rounded-2xl w-full" />
          </div>
        ) : insights.length === 0 ? (
          <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed border-border-subtle bg-card">
            <span className="grid size-10 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
              <ShieldCheck className="size-5" />
            </span>
            <h4 className="text-xs font-bold text-foreground">
              Keuangan Anda Berada di Jalur yang Tepat!
            </h4>
            <p className="text-[11px] text-secondary mt-1.5 max-w-xs leading-relaxed">
              Asisten AI tidak menemukan potensi penyimpangan anggaran, pembengkakan pengeluaran, atau ketidakseimbangan dompet saat ini.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {insights.map((insight) => (
              <InsightListItem key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>

      {/* Quick AI Tip card */}
      {!loading && !analyzing && (
        <Card className="p-4 bg-violet-600 text-white rounded-2xl relative overflow-hidden border-none shadow-md shadow-violet-600/10">
          <div className="absolute -bottom-16 -right-16 size-28 bg-white/5 blur-xl rounded-full" />
          <TrendingUp className="size-5 text-violet-200" />
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-violet-200 mt-2.5">
            💡 Tip Asisten Keuangan
          </h4>
          <p className="text-xs font-medium text-white/95 mt-1 leading-relaxed">
            Jaga pengeluaran non-pokok (Wants) Anda di bawah 30% dari total pendapatan bersih bulanan untuk memastikan target tabungan masa depan tercapai tanpa kendala likuiditas.
          </p>
        </Card>
      )}
    </div>
  );
}

interface InsightListItemProps {
  insight: FinancialInsight;
}

function InsightListItem({ insight }: InsightListItemProps) {
  const { type, title, description, actionLabel, actionUrl } = insight;

  const typeConfig = {
    warning: {
      border: "border-amber-500/20 dark:border-amber-500/30",
      bg: "bg-amber-50/40 dark:bg-amber-950/5",
      iconBg: "bg-amber-500/10 text-amber-600",
      icon: <AlertTriangle className="size-4.5 shrink-0" strokeWidth={2} />,
    },
    success: {
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      bg: "bg-emerald-50/40 dark:bg-emerald-950/5",
      iconBg: "bg-emerald-500/10 text-emerald-600",
      icon: <CheckCircle2 className="size-4.5 shrink-0" strokeWidth={2} />,
    },
    info: {
      border: "border-blue-500/20 dark:border-blue-500/30",
      bg: "bg-blue-50/40 dark:bg-blue-950/5",
      iconBg: "bg-blue-500/10 text-blue-600",
      icon: <Info className="size-4.5 shrink-0" strokeWidth={2} />,
    },
  }[type] || {
    border: "border-border-subtle",
    bg: "bg-card-subtle/50",
    iconBg: "bg-secondary-soft text-secondary",
    icon: <Info className="size-4.5 shrink-0" strokeWidth={2} />,
  };

  return (
    <div
      className={cn(
        "flex gap-3.5 rounded-2xl border p-4 transition-all duration-200 hover:shadow-xs",
        typeConfig.border,
        typeConfig.bg
      )}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl border border-transparent", typeConfig.iconBg)}>
        {typeConfig.icon}
      </span>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-foreground leading-snug">
          {title}
        </h4>
        <p className="text-[11px] text-secondary mt-1 leading-relaxed">
          {description}
        </p>

        {actionLabel && actionUrl && (
          <Link
            href={actionUrl}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:text-accent-hover mt-2.5 group"
          >
            {actionLabel}
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
