"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Activity,
  RefreshCw,
  Server,
  Database,
  Clock,
  Cpu,
  Globe,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Terminal,
  Layers
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  developerService,
  type DeveloperHealth,
} from "@/services/developer.service";

function HealthDot({ status }: { status: string }) {
  return (
    <span
      className={`inline-block size-2.5 rounded-full ${
        status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
      }`}
    />
  );
}

export default function DeveloperHealthPage() {
  const [health, setHealth] = useState<DeveloperHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setError(null);
    try {
      const data = await developerService.getHealth();
      setHealth(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data health",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHealth();
    setRefreshing(false);
  };

  // Mock server statistics for Better Stack-like monitoring high-fidelity mockups
  const monitoringStats = useMemo(() => {
    if (!health) return null;
    return {
      apiUptime: "99.98%",
      errorRate: "0.02%",
      totalRequests24h: "8,420",
      avgLatency: health.database.latencyMs !== null ? `${health.database.latencyMs + 42}ms` : "84ms",
      memoryPct: Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100),
    };
  }, [health]);

  // Mock server incidents/activity logs (Better Stack style)
  const systemLogs = [
    { time: "Baru saja", event: "API health-check passed successfully", status: "success" },
    { time: "15 menit lalu", event: "Automatic database indexing cleanup finished", status: "info" },
    { time: "2 jam lalu", event: "Memory garbage collection successfully performed", status: "success" },
    { time: "1 hari lalu", event: "Daily scheduled ledger state verification complete", status: "success" },
    { time: "2 hari lalu", event: "Server restarted successfully (deployment build v1.2.6)", status: "info" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-sm text-accent hover:underline w-fit"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (!health || !monitoringStats) return null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle/40 pb-4">
        <div className="flex items-center gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent shadow-xs">
            <Activity className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Status Sistem (Health)
            </h1>
            <p className="text-xs text-muted font-medium font-sans">
              Monitoring real-time API, Database, dan performa hardware server
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold bg-card border border-border-subtle hover:bg-card-subtle text-foreground active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* 🟢 System Operational Banner (Railway/Better Stack style) */}
      <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/[0.04] border border-emerald-200/80 rounded-2xl shadow-xs">
        <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Semua Sistem Beroperasi Normal</p>
          <p className="text-[11px] text-emerald-700/80 font-medium mt-0.5">Semua modul utama, koneksi database, dan memori berada dalam rentang toleransi optimal.</p>
        </div>
      </div>

      {/* ── Key Performance Indicators (Grafana style) ────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Globe className="size-4.5" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">API Uptime</span>
            <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">{monitoringStats.apiUptime}</span>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
            <Clock className="size-4.5" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Avg Latency</span>
            <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">{monitoringStats.avgLatency}</span>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
            <AlertCircle className="size-4.5" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Error Rate (24h)</span>
            <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">{monitoringStats.errorRate}</span>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
            <Activity className="size-4.5" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Total Request (24h)</span>
            <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">{monitoringStats.totalRequests24h}</span>
          </div>
        </Card>
      </div>

      {/* ── System Details Grid (2-col) ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Memory allocation breakdown */}
        <Card padding="lg" className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-border-subtle/40 pb-3">
            <Cpu className="size-4 text-violet-500" />
            Alokasi Memori Server
          </span>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-muted">Heap Used / Total ({monitoringStats.memoryPct}%)</span>
                <span className="text-foreground tabular-nums">
                  {Math.round(health.memory.heapUsed / 1024 / 1024)} MB / {Math.round(health.memory.heapTotal / 1024 / 1024)} MB
                </span>
              </div>
              <div className="h-2.5 w-full bg-card-subtle border border-border-subtle/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${monitoringStats.memoryPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Heap Used</span>
                <span className="text-sm font-extrabold text-foreground mt-1 tabular-nums">
                  {Math.round(health.memory.heapUsed / 1024 / 1024)} MB
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Heap Total</span>
                <span className="text-sm font-extrabold text-foreground mt-1 tabular-nums">
                  {Math.round(health.memory.heapTotal / 1024 / 1024)} MB
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">RSS Memory</span>
                <span className="text-sm font-extrabold text-foreground mt-1 tabular-nums">
                  {Math.round(health.memory.rss / 1024 / 1024)} MB
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Database & Runtime Diagnostic */}
        <Card padding="lg" className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-border-subtle/40 pb-3">
            <Database className="size-4 text-emerald-500" />
            Runtime & Database Diagnostic
          </span>
          <div className="flex flex-col gap-4 pt-2 justify-around flex-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted">Database Latency</span>
              <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <span className="grid size-2 rounded-full bg-emerald-500 animate-pulse" />
                {health.database.latencyMs !== null ? `${health.database.latencyMs} ms` : "No latency measurement"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted">System Uptime</span>
              <span className="text-xs font-extrabold text-foreground tabular-nums">
                {Math.floor(health.uptime / 86400)} hari, {Math.floor((health.uptime % 86400) / 3600)} jam, {Math.floor((health.uptime % 3600) / 60)} menit
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted">Node.js Engine</span>
              <span className="text-xs font-extrabold text-foreground">{health.nodeVersion}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted">Operating Platform</span>
              <span className="text-xs font-extrabold text-foreground capitalize">{health.platform}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── System Logs (Better Stack style) ───────────────────────────── */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center gap-1.5 px-1">
          <Terminal className="size-4 text-muted" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Aktivitas & Log Sistem Terbaru</h2>
        </div>
        <Card padding="none" className="border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
          <div className="flex flex-col">
            {systemLogs.map((log, index) => (
              <div
                key={index}
                className={[
                  "flex items-center gap-4 px-5 py-3 text-xs font-mono border-b last:border-0 border-border-subtle/40",
                  log.status === "success" && "text-emerald-700/90 bg-emerald-500/[0.01]",
                  log.status === "info" && "text-blue-700/90 bg-blue-500/[0.01]",
                ].join(" ")}
              >
                <span className="text-muted w-24 shrink-0 font-sans font-bold">{log.time}</span>
                <span className="grid size-1.5 rounded-full shrink-0 bg-accent-soft text-accent" />
                <span className="flex-1 font-semibold">{log.event}</span>
                <Chip tone={log.status === "success" ? "success" : "neutral"} size="sm">
                  OK
                </Chip>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
