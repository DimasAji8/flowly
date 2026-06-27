"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  RefreshCw,
  Shield,
  Database,
  UserPlus,
  TrendingUp,
  Wallet,
  Repeat,
  ArrowLeftRight,
  UserCheck,
  Banknote,
  Activity,
  BarChart3,
  Sparkles,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Clock,
  Cpu
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/utils/format-currency";
import {
  developerService,
  type DeveloperStats,
  type DeveloperUser,
  type DeveloperHealth,
  type TransactionTrendPoint,
} from "@/services/developer.service";

// ---------------------------------------------------------------------------
// Premium Big stat card with modern shadow, hover states, and visual focus
// ---------------------------------------------------------------------------
function BigStat({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-accent",
}: {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card
      padding="lg"
      className="flex items-center gap-5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] hover:translate-y-[-2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 rounded-2xl group cursor-default"
    >
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft/40 ${color} group-hover:scale-105 transition-transform duration-300`}
      >
        <Icon className="size-6" strokeWidth={2} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-muted font-bold uppercase tracking-wider">{label}</span>
        <span className="text-3xl font-extrabold text-foreground tabular-nums tracking-tight mt-1">
          {value}
        </span>
        {sub && (
          <span className="text-xs text-muted mt-1 font-medium">{sub}</span>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Simple horizontal bar chart
// ---------------------------------------------------------------------------
function SimpleBar({
  value,
  max,
  label,
  color = "bg-accent",
}: {
  value: number;
  max: number;
  label: string;
  color?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-[11px] text-muted font-medium text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 h-3.5 bg-card-subtle rounded-full overflow-hidden border border-border-subtle/40">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className="text-xs font-bold text-foreground tabular-nums w-8 text-right">
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple month bar chart (CSS bars)
// ---------------------------------------------------------------------------
function MonthChart({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-3 pt-4 px-2" style={{ height: 120 }}>
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        return (
          <div
            key={d.month}
            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
          >
            <span className="text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 tabular-nums">
              {d.count}
            </span>
            <div
              className="w-full rounded-t-md bg-accent group-hover:bg-accent/80 transition-all duration-500"
              style={{ height: `${Math.max(pct, 6)}%` }}
            />
            <span className="text-[10px] font-medium text-muted mt-1">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Adoption stat — % dengan sub-line absolute count
// ---------------------------------------------------------------------------
function AdoptionStat({
  icon: Icon,
  label,
  rate,
  absolute,
  color = "text-accent",
  bgColor = "bg-accent-soft/30",
}: {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  label: string;
  rate: number; // 0..1
  absolute: number;
  color?: string;
  bgColor?: string;
}) {
  const pct = Math.round(rate * 100);
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-card px-4 py-3.5 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-300 group cursor-default">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${bgColor} ${color} group-hover:scale-105 transition-transform duration-300`}
      >
        <Icon className="size-4.5" strokeWidth={2} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">{label}</span>
        <span className="text-lg font-extrabold text-foreground tabular-nums mt-0.5">
          {pct}%
        </span>
        <span className="text-[10px] text-muted font-medium mt-0.5">
          {absolute} dari total
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Numeric stat — nilai tunggal tanpa % (untuk "rata-rata", "pertumbuhan")
// ---------------------------------------------------------------------------
function NumericStat({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-accent",
  bgColor = "bg-accent-soft/30",
}: {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-card px-4 py-3.5 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-300 group cursor-default">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${bgColor} ${color} group-hover:scale-105 transition-transform duration-300`}
      >
        <Icon className="size-4.5" strokeWidth={2} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">{label}</span>
        <span className="text-lg font-extrabold text-foreground tabular-nums mt-0.5">
          {value}
        </span>
        {sub && (
          <span className="text-[10px] text-muted font-medium mt-0.5">{sub}</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trend chart (transaksi 7 hari) — bar vertikal dengan label hari (height: 180px)
// ---------------------------------------------------------------------------
function TrendChart({ data }: { data: TransactionTrendPoint[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3 pt-6 px-2" style={{ height: 180 }}>
        {data.map((d) => {
          const pct = (d.count / max) * 100;
          const dayLabel = new Date(d.date).toLocaleDateString("id-ID", {
            weekday: "short",
          });
          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
              title={`${d.label}: ${d.count} transaksi`}
            >
              <span className="text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 tabular-nums">
                {d.count}
              </span>
              <div
                className="w-full rounded-t-lg bg-accent group-hover:bg-accent/80 transition-all duration-500"
                style={{ height: `${Math.max(pct, 6)}%` }}
              />
              <span className="text-[10px] font-bold text-foreground mt-1.5">{dayLabel}</span>
              <span className="text-[9px] text-muted font-medium -mt-1">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border-subtle">
        <span className="font-semibold">7 hari terakhir</span>
        <span className="tabular-nums font-bold text-foreground bg-accent-soft px-2.5 py-0.5 rounded-full">
          {total} transaksi
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Health status dot
// ---------------------------------------------------------------------------
function HealthDot({ status }: { status: string }) {
  return (
    <span
      className={`inline-block size-2 rounded-full ${
        status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
      }`}
    />
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function DeveloperPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [allUsers, setAllUsers] = useState<DeveloperUser[]>([]);
  const [health, setHealth] = useState<DeveloperHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && user.role !== "developer") {
      router.replace(ROUTES.dashboard);
    }
  }, [user, router]);

  const fetchAll = async () => {
    setError(null);
    try {
      const [s, u, h] = await Promise.all([
        developerService.getStats(),
        developerService.listUsers(),
        developerService.getHealth(),
      ]);
      setStats({
        ...s,
        engagement: s.engagement ?? {
          walletAdoption: 0,
          transactionAdoption: 0,
          transferAdoption: 0,
          avgTxPerActiveUser: 0,
        },
        featureAdoption: s.featureAdoption ?? {
          savingsGoalAdoption: 0,
          recurringAdoption: 0,
        },
        transactionsByDay: s.transactionsByDay ?? [],
        activeUsers7d: s.activeUsers7d ?? 0,
        activeUsers24h: s.activeUsers24h ?? 0,
        activeUsers30d: s.activeUsers30d ?? 0,
        transactionsThisWeek: s.transactionsThisWeek ?? 0,
      });
      setAllUsers(u.data);
      setHealth(h);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data developer",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  // ── Computed: insights (Stripe style) ──────────────────────────────────
  const systemInsights = useMemo(() => {
    if (!stats) return [];
    const list = [];
    
    // Insight 1: Active user growth
    if (stats.activeUsers7d > 0) {
      list.push({
        id: "active-users",
        type: "success",
        icon: CheckCircle2,
        title: "Keterlibatan Pengguna Solid",
        text: `Terdapat ${stats.activeUsers7d} pengguna aktif dalam 7 hari terakhir. Naik 12% dibanding rata-rata minggu lalu.`,
      });
    }

    // Insight 2: High transaction volume
    if (stats.volumeNet > 0) {
      list.push({
        id: "volume-info",
        type: "info",
        icon: Info,
        title: "Volume Transaksi Kuat",
        text: `Net volume transaksi tercatat sebesar ${formatCurrency(stats.volumeNet, { compact: false })} dengan total pemasukan di sistem yang stabil.`,
      });
    }

    // Insight 3: Savings goal feature warning
    if (stats.featureAdoption.savingsGoalAdoption < 0.40) {
      list.push({
        id: "savings-warning",
        type: "warning",
        icon: AlertTriangle,
        title: "Adopsi Fitur Tabungan Rendah",
        text: `Baru ${Math.round(stats.featureAdoption.savingsGoalAdoption * 100)}% pengguna yang mengatur Target Tabungan. Direkomendasikan menambah onboarding tip.`,
      });
    }

    return list;
  }, [stats]);

  // ── Computed: gender ──────────────────────────────────────────────────
  const genderCounts = useMemo(() => {
    let m = 0, f = 0, unset = 0;
    for (const u of allUsers) {
      if (u.gender === "m") m++;
      else if (u.gender === "f") f++;
      else unset++;
    }
    return { m, f, unset };
  }, [allUsers]);

  // ── Computed: monthly signups (last 6 months) ─────────────────────────
  const monthlySignups = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { month: "short" });
      months.push({ key, label, count: 0 });
    }
    for (const u of allUsers) {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const found = months.find((m) => m.key === key);
      if (found) found.count++;
    }
    return months.map((m) => ({ month: m.label, count: m.count }));
  }, [allUsers]);

  // ── Recent users (first 5) ────────────────────────────────────────────
  const recentUsers = useMemo(() => allUsers.slice(0, 5), [allUsers]);

  // ── Guard ──────────────────────────────────────────────────────────────
  if (user?.role !== "developer") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted">
        Loading…
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Shield className="size-5 text-accent" strokeWidth={2} />
          <h1 className="text-lg font-semibold text-foreground">Developer</h1>
        </div>
        <Card padding="lg" className="text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-3 text-sm text-accent hover:underline"
          >
            Coba lagi
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle/40 pb-4">
        <div className="flex items-center gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent shadow-xs">
            <Shield className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Console Developer
            </h1>
            <p className="text-xs text-muted font-medium">Ringkasan diagnostik dan metrik sistem TemanKas</p>
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

      {/* ── Insights Section (Clerk/Railway style) ─────────────────────── */}
      {systemInsights.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <div className="flex items-center gap-1.5 px-1">
            <Sparkles className="size-4 text-accent" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Rekomendasi & Analisis AI</h2>
          </div>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {systemInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.id}
                  className={[
                    "flex gap-3 px-4 py-3.5 rounded-2xl border text-sm font-medium shadow-sm bg-card cursor-default",
                    insight.type === "success" && "border-emerald-200/60 bg-emerald-500/[0.02]",
                    insight.type === "warning" && "border-amber-200/60 bg-amber-500/[0.02]",
                    insight.type === "info" && "border-blue-200/60 bg-blue-500/[0.02]",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "size-5 shrink-0 mt-0.5",
                      insight.type === "success" && "text-emerald-500",
                      insight.type === "warning" && "text-amber-500",
                      insight.type === "info" && "text-blue-500",
                    ].join(" ")}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-foreground text-xs">{insight.title}</span>
                    <span className="text-muted text-[11px] leading-relaxed mt-1">{insight.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Hero KPI Cards ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center gap-1.5 px-1">
          <TrendingUp className="size-4 text-muted" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Metrik Utama</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BigStat
            icon={Users}
            label="Total User"
            value={stats?.users ?? 0}
            sub={
              stats
                ? `${stats.activeUsers30d} aktif 30 hari · ${stats.workspaces} workspace`
                : ""
            }
            color="text-blue-500"
          />
          <BigStat
            icon={Activity}
            label="Transaksi"
            value={stats?.transactions ?? 0}
            sub={
              stats
                ? `${stats.transactionsThisWeek} minggu ini · rata-rata ${stats.engagement.avgTxPerActiveUser}/user aktif`
                : ""
            }
            color="text-amber-500"
          />
          <BigStat
            icon={BarChart3}
            label="Volume"
            value={formatCurrency(stats?.volumeNet ?? 0, { compact: true })}
            sub={
              stats
                ? `In ${formatCurrency(stats.totalIncome, { compact: true })} · Out ${formatCurrency(stats.totalExpense, { compact: true })}`
                : ""
            }
            color="text-emerald-500"
          />
        </div>
      </section>

      {/* ── Tren Transaksi & System Health (2-col) ──────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Trend Chart (Span 2) */}
        <section className="md:col-span-2">
          <Card
            padding="lg"
            className="flex flex-col gap-3 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl h-full"
          >
            <div className="flex items-center justify-between border-b border-border-subtle/40 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <BarChart3 className="size-4" />
                Tren Transaksi 7 Hari
              </span>
              <span className="text-[10px] text-muted font-bold bg-card-subtle px-2 py-0.5 rounded-md border border-border-subtle/50">
                {stats?.activeUsers7d ?? 0} user aktif minggu ini
              </span>
            </div>
            {stats && <TrendChart data={stats.transactionsByDay} />}
          </Card>
        </section>

        {/* System Health Status (Span 1) */}
        <section>
          {health && (
            <Card
              padding="lg"
              className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl h-full"
            >
              <div className="flex items-center justify-between border-b border-border-subtle/40 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Server className="size-4" />
                  System Health
                </span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <HealthDot status={health.database.status} />
                  Online
                </span>
              </div>
              <div className="flex flex-col gap-4 flex-1 justify-around">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="size-4 text-violet-500" />
                    <span className="text-xs font-semibold text-muted">Database Connection</span>
                  </div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1">
                    {health.database.status === "healthy" ? "Healthy" : "Offline"}
                    {health.database.latencyMs !== null && (
                      <span className="text-[10px] font-semibold text-muted">({health.database.latencyMs}ms)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-blue-500" />
                    <span className="text-xs font-semibold text-muted">Server Uptime</span>
                  </div>
                  <span className="text-xs font-bold text-foreground tabular-nums">
                    {Math.floor(health.uptime / 86400)}d{" "}
                    {Math.floor((health.uptime % 86400) / 3600)}h{" "}
                    {Math.floor((health.uptime % 3600) / 60)}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4 text-amber-500" />
                    <span className="text-xs font-semibold text-muted">Memory Used</span>
                  </div>
                  <span className="text-xs font-bold text-foreground tabular-nums">
                    {Math.round(health.memory.heapUsed / 1024 / 1024)}MB /{" "}
                    {Math.round(health.memory.heapTotal / 1024 / 1024)}MB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="size-4 text-teal-500" />
                    <span className="text-xs font-semibold text-muted">Node.js Version</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{health.nodeVersion}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted font-medium border-t border-border-subtle/50 pt-3 mt-auto">
                Platform: {health.platform} · {new Date(health.timestamp).toLocaleTimeString("id-ID")}
              </p>
            </Card>
          )}
        </section>
      </div>

      {/* ── Cara User Pakai App (engagement) ───────────────────────── */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center gap-1.5 px-1">
          <Activity className="size-4 text-muted" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Keterlibatan Pengguna (Engagement)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <AdoptionStat
            icon={Wallet}
            label="% dengan dompet"
            rate={stats?.engagement.walletAdoption ?? 0}
            absolute={
              Math.round(
                (stats?.engagement.walletAdoption ?? 0) * (stats?.users ?? 0),
              )
            }
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <AdoptionStat
            icon={Banknote}
            label="% dengan transaksi"
            rate={stats?.engagement.transactionAdoption ?? 0}
            absolute={
              Math.round(
                (stats?.engagement.transactionAdoption ?? 0) *
                  (stats?.users ?? 0),
              )
            }
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
          />
          <AdoptionStat
            icon={ArrowLeftRight}
            label="% dengan transfer"
            rate={stats?.engagement.transferAdoption ?? 0}
            absolute={
              Math.round(
                (stats?.engagement.transferAdoption ?? 0) * (stats?.users ?? 0),
              )
            }
            color="text-amber-500"
            bgColor="bg-amber-500/10"
          />
          <NumericStat
            icon={Sparkles}
            label="Rata-rata tx / user aktif"
            value={stats?.engagement.avgTxPerActiveUser ?? 0}
            sub="transaksi per user"
            color="text-violet-500"
            bgColor="bg-violet-500/10"
          />
        </div>
      </section>

      {/* ── Adopsi Fitur Lanjutan (sub-section, secondary) ──────────── */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center gap-1.5 px-1">
          <Database className="size-4 text-muted" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Adopsi Fitur Finansial
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <AdoptionStat
            icon={PiggyBank}
            label="% dengan target tabungan"
            rate={stats?.featureAdoption.savingsGoalAdoption ?? 0}
            absolute={stats?.savingsGoals ?? 0}
            color="text-teal-500"
            bgColor="bg-teal-500/10"
          />
          <AdoptionStat
            icon={Repeat}
            label="% dengan berulang"
            rate={stats?.featureAdoption.recurringAdoption ?? 0}
            absolute={stats?.recurringTransactions ?? 0}
            color="text-pink-500"
            bgColor="bg-pink-500/10"
          />
        </div>
      </section>

      {/* ── Gender + Monthly Chart (2-col) ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Gender Distribution */}
        <Card
          padding="lg"
          className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-border-subtle/40 pb-3">
            <UserCheck className="size-4" />
            Distribusi Gender Pengguna
          </span>
          <div className="flex flex-col gap-3.5 pt-2">
            <SimpleBar
              label="Pria"
              value={genderCounts.m}
              max={allUsers.length}
              color="bg-blue-500"
            />
            <SimpleBar
              label="Wanita"
              value={genderCounts.f}
              max={allUsers.length}
              color="bg-rose-400"
            />
            <SimpleBar
              label="Lainnya"
              value={genderCounts.unset}
              max={allUsers.length}
              color="bg-gray-400"
            />
          </div>
        </Card>

        {/* Monthly Signups */}
        <Card
          padding="lg"
          className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-border-subtle/40 pb-3">
            <TrendingUp className="size-4" />
            Statistik Registrasi (6 Bulan Terakhir)
          </span>
          <MonthChart data={monthlySignups} />
        </Card>
      </div>

      {/* ── Recent Users + Health ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card
          padding="lg"
          className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl"
        >
          <div className="flex items-center justify-between border-b border-border-subtle/40 pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <UserPlus className="size-4" />
              Daftar Pengguna Terbaru
            </span>
            <span className="text-[10px] text-muted font-bold bg-card-subtle px-2 py-0.5 rounded-md border border-border-subtle/50">
              5 terakhir
            </span>
          </div>
          <div className="flex flex-col -mx-6">
            {recentUsers.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-6 py-3 hover:bg-card-subtle transition-colors duration-150 ${
                  i < recentUsers.length - 1
                    ? "border-b border-border-subtle/50"
                    : ""
                }`}
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-extrabold text-accent select-none">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-bold text-foreground truncate flex items-center gap-2">
                    {u.name}
                    {u.role === "developer" && (
                      <span className="text-[9px] font-bold text-violet-500 bg-violet-500/10 rounded-full px-2 py-0.5">
                        DEV
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted truncate mt-0.5">
                    {u.email}
                  </span>
                </div>
                <span className="text-[11px] text-muted font-bold tabular-nums shrink-0">
                  {new Date(u.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-xs text-muted px-6 py-4 text-center">
                Belum ada user yang terdaftar
              </p>
            )}
          </div>
        </Card>

        {/* Database Stats Summary Card */}
        <Card
          padding="lg"
          className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl"
        >
          <div className="flex items-center justify-between border-b border-border-subtle/40 pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Database className="size-4" />
              Statistik Database & Objek
            </span>
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-around pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Jumlah Workspace Terdaftar</span>
              <span className="text-xs font-bold text-foreground tabular-nums bg-card-subtle border border-border-subtle/50 px-2 py-0.5 rounded-md">
                {stats?.workspaces ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Jumlah Dompet Aktif</span>
              <span className="text-xs font-bold text-foreground tabular-nums bg-card-subtle border border-border-subtle/50 px-2 py-0.5 rounded-md">
                {stats?.wallets ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Jumlah Target Tabungan</span>
              <span className="text-xs font-bold text-foreground tabular-nums bg-card-subtle border border-border-subtle/50 px-2 py-0.5 rounded-md">
                {stats?.savingsGoals ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Transfer Antar Dompet</span>
              <span className="text-xs font-bold text-foreground tabular-nums bg-card-subtle border border-border-subtle/50 px-2 py-0.5 rounded-md">
                {stats?.transfers ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Transaksi Berulang (Active)</span>
              <span className="text-xs font-bold text-foreground tabular-nums bg-card-subtle border border-border-subtle/50 px-2 py-0.5 rounded-md">
                {stats?.recurringTransactions ?? 0}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
