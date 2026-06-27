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
    
    // Warnings reduce score, successes increase, info is neutral
    insights.forEach((insight) => {
      if (insight.type === "warning") baseScore -= 12;
      if (insight.type === "success") baseScore += 2;
    });

    return Math.max(30, Math.min(100, baseScore));
  };

  const score = computeHealthScore();

  return (
    <div className="flex flex-col gap-8 flowly-enter pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-violet-500/10 text-violet-600 shadow-xs border border-violet-100">
            <Sparkles className="size-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            TemanKas AI
          </h1>
        </div>
        <p className="text-sm text-secondary leading-relaxed max-w-3xl">
          Gunakan kecerdasan buatan untuk mengulas pola pengeluaran Anda, melacak target tabungan, dan mendeteksi anomali anggaran secara otomatis.
        </p>
      </div>

      {/* Hero Analysis Control Panel */}
      <div 
        className="relative overflow-hidden rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-transparent p-6 md:p-8"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px -4px rgba(139,92,246,0.04)" }}
      >
        <div className="absolute -top-12 -right-12 size-36 rounded-full bg-violet-500/5 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-violet-500/10 text-violet-600">
              <Brain className={cn("size-6", analyzing && "animate-pulse")} />
            </span>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-foreground">
                Asisten Analisis Finansial Cerdas
              </h3>
              <p className="text-xs text-secondary mt-1 max-w-xl leading-relaxed">
                Teknologi AI kami memindai 30 hari riwayat transaksi, pembagian kategori budget (Needs, Wants, Savings), dan kesiapan alokasi dana darurat Anda.
              </p>
              {lastRun && (
                <span className="text-[10px] font-bold text-violet-600/80 uppercase tracking-wider mt-2.5">
                  Analisis Terakhir: Hari ini pukul {lastRun}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              onClick={handleStartAnalysis}
              disabled={loading || analyzing}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-5 font-bold shadow-md shadow-violet-600/10 transition-all flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Menganalisis...
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
      </div>

      {/* Main Insights Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Insights List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
              Rekomendasi & Temuan ({loading || analyzing ? "..." : insights.length})
            </h2>
          </div>

          {loading || analyzing ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-28 rounded-2xl w-full" />
              <Skeleton className="h-28 rounded-2xl w-full" />
              <Skeleton className="h-28 rounded-2xl w-full" />
            </div>
          ) : insights.length === 0 ? (
            <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed border-border-subtle bg-card">
              <span className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 mb-4">
                <ShieldCheck className="size-6" />
              </span>
              <h4 className="text-sm font-bold text-foreground">
                Keuangan Anda Berada di Jalur yang Tepat!
              </h4>
              <p className="text-xs text-secondary mt-1.5 max-w-sm leading-relaxed">
                Asisten AI tidak menemukan potensi penyimpangan anggaran, pembengkakan pengeluaran, atau ketidakseimbangan dompet saat ini.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {insights.map((insight) => (
                <InsightListItem key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Score & Summary Dashboard */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center border-b border-border-subtle pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
              Skor Kesehatan Keuangan
            </h2>
          </div>

          {loading || analyzing ? (
            <Skeleton className="h-64 rounded-2xl w-full" />
          ) : (
            <Card 
              className="p-6 bg-card flex flex-col items-center justify-center text-center relative overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Score Indicator Ring */}
              <div className="relative size-32 flex items-center justify-center mb-4">
                <svg className="size-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    className="stroke-border-subtle fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    className={cn(
                      "fill-none transition-all duration-1000",
                      score && score >= 85
                        ? "stroke-emerald-500"
                        : score && score >= 70
                        ? "stroke-amber-500"
                        : "stroke-red-500"
                    )}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={score ? (2 * Math.PI * 54) * (1 - score / 100) : 0}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-foreground tabular-nums leading-none">
                    {score}
                  </span>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1.5">
                    Skor Anda
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-foreground">
                {score && score >= 85
                  ? "Kondisi Keuangan Sangat Prima"
                  : score && score >= 70
                  ? "Cukup Baik, Perlu Penyesuaian"
                  : "Risiko Tinggi, Evaluasi Segera"}
              </h4>
              <p className="text-xs text-secondary mt-1.5 leading-relaxed">
                {score && score >= 85
                  ? "Pola pengeluaran Anda terjaga seimbang dengan target tabungan bulanan. Teruskan pertahanan disiplin ini!"
                  : score && score >= 70
                  ? "Terdapat beberapa pengeluaran Wants yang melebihi batas atau saldo tabungan yang mulai pas-pasan."
                  : "Pengeluaran melampaui pendapatan bersih atau target tabungan diabaikan secara signifikan."}
              </p>
            </Card>
          )}

          {/* Quick AI Tip card */}
          <Card className="p-5 bg-violet-600 text-white rounded-2xl relative overflow-hidden border-none shadow-md shadow-violet-600/10">
            <div className="absolute -bottom-16 -right-16 size-32 rounded-full bg-white/5 blur-xl" />
            <TrendingUp className="size-6 text-violet-200" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-violet-200 mt-3.5">
              💡 Tip Asisten Keuangan
            </h4>
            <p className="text-xs font-medium text-white/95 mt-1.5 leading-relaxed">
              Jaga pengeluaran non-pokok (Wants) Anda di bawah 30% dari total pendapatan bersih bulanan untuk memastikan target tabungan masa depan tercapai tanpa kendala likuiditas.
            </p>
          </Card>
        </div>

      </div>
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
      icon: <AlertTriangle className="size-5 shrink-0" strokeWidth={2} />,
    },
    success: {
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      bg: "bg-emerald-50/40 dark:bg-emerald-950/5",
      iconBg: "bg-emerald-500/10 text-emerald-600",
      icon: <CheckCircle2 className="size-5 shrink-0" strokeWidth={2} />,
    },
    info: {
      border: "border-blue-500/20 dark:border-blue-500/30",
      bg: "bg-blue-50/40 dark:bg-blue-950/5",
      iconBg: "bg-blue-500/10 text-blue-600",
      icon: <Info className="size-5 shrink-0" strokeWidth={2} />,
    },
  }[type] || {
    border: "border-border-subtle",
    bg: "bg-card-subtle/50",
    iconBg: "bg-secondary-soft text-secondary",
    icon: <Info className="size-5 shrink-0" strokeWidth={2} />,
  };

  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border p-5 transition-all duration-200 hover:shadow-xs",
        typeConfig.border,
        typeConfig.bg
      )}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl border border-transparent", typeConfig.iconBg)}>
        {typeConfig.icon}
      </span>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-foreground leading-snug">
          {title}
        </h4>
        <p className="text-xs text-secondary mt-1.5 leading-relaxed">
          {description}
        </p>

        {actionLabel && actionUrl && (
          <Link
            href={actionUrl}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover mt-3.5 group"
          >
            {actionLabel}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
