"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  RefreshCw,
  LayoutDashboard,
  Shield,
  Database,
  UserPlus,
  TrendingUp,
  Wallet,
  Target,
  Repeat,
  ArrowLeftRight,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import {
  developerService,
  type DeveloperStats,
  type DeveloperUser,
  type DeveloperHealth,
} from "@/services/developer.service";

// ---------------------------------------------------------------------------
// Big stat card — large prominent number
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
    <Card padding="lg" className="flex items-center gap-5">
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft ${color}`}
      >
        <Icon className="size-6" strokeWidth={2} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted font-medium">{label}</span>
        <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
          {value}
        </span>
        {sub && (
          <span className="text-[11px] text-muted mt-0.5">{sub}</span>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Mini stat — small compact count card
// ---------------------------------------------------------------------------
function MiniStat({
  icon: Icon,
  label,
  value,
  color = "text-accent",
  bgColor = "bg-accent-soft",
}: {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  color?: string;
  bgColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle px-4 py-3">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl ${bgColor} ${color}`}
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-muted font-medium">{label}</span>
        <span className="text-base font-bold text-foreground tabular-nums">
          {value}
        </span>
      </div>
    </div>
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
      <span className="w-8 text-[11px] text-muted text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 h-4 bg-card-subtle rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground tabular-nums w-6 text-right">
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
    <div className="flex items-end gap-2 pt-2" style={{ height: 80 }}>
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        return (
          <div
            key={d.month}
            className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
          >
            <span className="text-[10px] font-semibold text-foreground tabular-nums">
              {d.count}
            </span>
            <div
              className="w-full rounded-t-md bg-accent transition-all duration-500"
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
            <span className="text-[9px] text-muted">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Health badge
// ---------------------------------------------------------------------------
function HealthDot({ status }: { status: string }) {
  return (
    <span
      className={`inline-block size-1.5 rounded-full ${
        status === "healthy" ? "bg-emerald-500" : "bg-red-500"
      }`}
    />
  );
}

// ---------------------------------------------------------------------------
// Page
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
      setStats(s);
      setAllUsers(u);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

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
    const months: { label: string; count: number }[] = [];
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

  const miniColor = (i: number) => {
    const palettes = [
      { color: "text-blue-500", bg: "bg-blue-500/10" },
      { color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { color: "text-orange-500", bg: "bg-orange-500/10" },
      { color: "text-pink-500", bg: "bg-pink-500/10" },
    ];
    return palettes[i % palettes.length];
  };

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

  // ── Content ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <Shield className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Developer
            </h1>
            <p className="text-xs text-muted">Ringkasan sistem</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-soft transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* ── Big Stats ────────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BigStat
            icon={Users}
            label="Total User"
            value={stats?.users ?? 0}
            sub={`${stats?.users ?? 0} akun terdaftar`}
            color="text-blue-500"
          />
          <BigStat
            icon={LayoutDashboard}
            label="Workspace"
            value={stats?.workspaces ?? 0}
            sub={
              stats
                ? `Rata-rata ${(stats.workspaces / Math.max(stats.users, 1)).toFixed(1)} per user`
                : ""
            }
            color="text-violet-500"
          />
          <BigStat
            icon={Database}
            label="Transaksi"
            value={stats?.transactions ?? 0}
            sub={
              stats
                ? `Rata-rata ${(stats.transactions / Math.max(stats.users, 1)).toFixed(1)} per user`
                : ""
            }
            color="text-amber-500"
          />
        </div>
      </section>

      {/* ── Mini Stats (counts only, no financial) ───────────────────── */}
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <Database className="size-3.5 text-muted" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Ringkasan Data
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat
            icon={Wallet}
            label="Dompet"
            value={stats?.wallets ?? 0}
            {...miniColor(0)}
          />
          <MiniStat
            icon={Target}
            label="Target Tabungan"
            value={stats?.savingsGoals ?? 0}
            {...miniColor(1)}
          />
          <MiniStat
            icon={ArrowLeftRight}
            label="Transfer"
            value={stats?.transfers ?? 0}
            {...miniColor(2)}
          />
          <MiniStat
            icon={Repeat}
            label="Berulang"
            value={stats?.recurringTransactions ?? 0}
            {...miniColor(3)}
          />
        </div>
      </section>

      {/* ── Gender + Monthly Chart (2-col) ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Gender Distribution */}
        <Card padding="md" className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted flex items-center gap-1.5">
            <UserCheck className="size-3.5" />
            Distribusi Gender
          </span>
          <div className="flex flex-col gap-2">
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
              label="—"
              value={genderCounts.unset}
              max={allUsers.length}
              color="bg-gray-400"
            />
          </div>
        </Card>

        {/* Monthly Signups */}
        <Card padding="md" className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted flex items-center gap-1.5">
            <TrendingUp className="size-3.5" />
            Registrasi 6 Bulan
          </span>
          <MonthChart data={monthlySignups} />
        </Card>
      </div>

      {/* ── Recent Users + Health ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Recent Users */}
        <Card padding="md" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted flex items-center gap-1.5">
              <UserPlus className="size-3.5" />
              User Terbaru
            </span>
            <span className="text-[10px] text-muted">5 terakhir</span>
          </div>
          <div className="flex flex-col -mx-5">
            {recentUsers.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-5 py-2.5 ${
                  i < recentUsers.length - 1
                    ? "border-b border-border-subtle"
                    : ""
                }`}
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent select-none">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                    {u.name}
                    {u.role === "developer" && (
                      <span className="text-[10px] font-semibold text-violet-500 bg-violet-500/10 rounded-full px-2 py-0.5">
                        DEV
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted truncate">
                    {u.email}
                  </span>
                </div>
                <span className="text-[11px] text-muted tabular-nums shrink-0">
                  {new Date(u.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-xs text-muted px-5 py-4 text-center">
                Belum ada user
              </p>
            )}
          </div>
        </Card>

        {/* System Health */}
        {health && (
          <Card padding="md" className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted flex items-center gap-1.5">
              <TrendingUp className="size-3.5" />
              System Health
            </span>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-[10px] text-muted">Database</p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-px">
                  <HealthDot status={health.database.status} />
                  <span className="capitalize">{health.database.status}</span>
                  {health.database.latencyMs !== null && (
                    <span className="text-[11px] text-muted font-normal">
                      {health.database.latencyMs}ms
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted">Uptime</p>
                <p className="text-sm font-semibold text-foreground mt-px tabular-nums">
                  {Math.floor(health.uptime / 86400)}d{" "}
                  {Math.floor((health.uptime % 86400) / 3600)}h{" "}
                  {Math.floor((health.uptime % 3600) / 60)}m
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted">Memory (heap)</p>
                <p className="text-sm font-semibold text-foreground mt-px tabular-nums">
                  {Math.round(health.memory.heapUsed / 1024 / 1024)}MB /{" "}
                  {Math.round(health.memory.heapTotal / 1024 / 1024)}MB
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted">Node.js</p>
                <p className="text-sm font-semibold text-foreground mt-px">
                  {health.nodeVersion}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted border-t border-border-subtle pt-3">
              {health.platform} ·{" "}
              {new Date(health.timestamp).toLocaleString("id-ID")}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
