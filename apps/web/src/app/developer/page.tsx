"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Database,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Repeat,
  RefreshCw,
  LayoutDashboard,
  Shield,
  Activity,
  Server,
  Clock,
  Cpu,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import {
  developerService,
  type DeveloperStats,
  type DeveloperUser,
  type DeveloperWorkspaceStats,
  type DeveloperHealth,
} from "@/services/developer.service";

// ---------------------------------------------------------------------------
// StatCard – ringkasan angka
// ---------------------------------------------------------------------------
function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-accent",
}: {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Card padding="md" className="flex items-center gap-3">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft ${color}`}
      >
        <Icon className="size-4.5" strokeWidth={2} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-muted font-medium">{label}</span>
        <span className="text-base font-semibold text-foreground tabular-nums">
          {value}
        </span>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------
function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        {title}
      </h2>
      {action}
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
  const [users, setUsers] = useState<DeveloperUser[]>([]);
  const [workspaceStats, setWorkspaceStats] =
    useState<DeveloperWorkspaceStats | null>(null);
  const [health, setHealth] = useState<DeveloperHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Proteksi: hanya developer yang bisa akses
  useEffect(() => {
    if (user && user.role !== "developer") {
      router.replace(ROUTES.dashboard);
    }
  }, [user, router]);

  const fetchAll = async () => {
    setError(null);
    try {
      const [s, u, ws, h] = await Promise.all([
        developerService.getStats(),
        developerService.listUsers(),
        developerService.getWorkspaceStats(),
        developerService.getHealth(),
      ]);
      setStats(s);
      setUsers(u);
      setWorkspaceStats(ws);
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
        <Skeleton className="h-7 w-44" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <SectionHeader title="Developer" />
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
    <div className="flex flex-col gap-7 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <Shield className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Developer
            </h1>
            <p className="text-xs text-muted">Statistik & debug sistem</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-soft transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* ── Ringkasan Data ────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Ringkasan Data" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total User"
            value={stats?.users ?? 0}
            color="text-blue-500"
          />
          <StatCard
            icon={LayoutDashboard}
            label="Workspaces"
            value={stats?.workspaces ?? 0}
            color="text-violet-500"
          />
          <StatCard
            icon={Wallet}
            label="Dompet"
            value={stats?.wallets ?? 0}
            color="text-emerald-500"
          />
          <StatCard
            icon={Database}
            label="Transaksi"
            value={stats?.transactions ?? 0}
            color="text-amber-500"
          />
          <StatCard
            icon={Target}
            label="Target Tabungan"
            value={stats?.savingsGoals ?? 0}
            color="text-rose-500"
          />
          <StatCard
            icon={ArrowUpRight}
            label="Total Pemasukan"
            value={
              stats
                ? `Rp ${(stats.totalIncome / 1000).toFixed(0)}rb`
                : 0
            }
            color="text-emerald-500"
          />
          <StatCard
            icon={ArrowDownRight}
            label="Total Pengeluaran"
            value={
              stats
                ? `Rp ${(stats.totalExpense / 1000).toFixed(0)}rb`
                : 0
            }
            color="text-red-500"
          />
          <StatCard
            icon={Repeat}
            label="Transaksi Berulang"
            value={stats?.recurringTransactions ?? 0}
            color="text-cyan-500"
          />
        </div>
      </section>

      {/* ── System Health ─────────────────────────────────────────────── */}
      {health && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="System Health" />
          <Card padding="md" className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-muted">
                  <Database className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[11px] text-muted font-medium">Database</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-px">
                    <HealthDot status={health.database.status} />
                    <span className="capitalize">{health.database.status}</span>
                    {health.database.latencyMs !== null && (
                      <span className="text-xs text-muted font-normal">
                        {health.database.latencyMs}ms
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-muted">
                  <Clock className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[11px] text-muted font-medium">Uptime</p>
                  <p className="text-sm font-semibold text-foreground mt-px tabular-nums">
                    {Math.floor(health.uptime / 86400)}d{" "}
                    {Math.floor((health.uptime % 86400) / 3600)}h
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-muted">
                  <Cpu className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[11px] text-muted font-medium">Memory</p>
                  <p className="text-sm font-semibold text-foreground mt-px tabular-nums">
                    {Math.round(health.memory.heapUsed / 1024 / 1024)}MB /{" "}
                    {Math.round(health.memory.heapTotal / 1024 / 1024)}MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-muted">
                  <Server className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[11px] text-muted font-medium">Node.js</p>
                  <p className="text-sm font-semibold text-foreground mt-px">
                    {health.nodeVersion}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted border-t border-border-subtle pt-4">
              <Activity className="size-3.5" strokeWidth={2} />
              Platform: {health.platform}
            </div>
          </Card>
        </section>
      )}

      {/* ── Workspaces ────────────────────────────────────────────────── */}
      {workspaceStats && workspaceStats.list.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title={`Workspaces (${workspaceStats.total})`}
            action={
              <span className="text-[11px] text-muted">
                Rerata {workspaceStats.avgMembersPerWorkspace.toFixed(1)} anggota
              </span>
            }
          />
          <div className="flex flex-col gap-2">
            {workspaceStats.list.map((ws) => (
              <Card
                key={ws.id}
                padding="sm"
                className="flex items-center justify-between gap-4"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {ws.name}
                  </span>
                  <span className="text-xs text-muted">
                    {ws.members} anggota · {ws.wallets} dompet ·{" "}
                    {ws.categories} kategori · {ws.transactions} transaksi ·{" "}
                    {ws.savingsGoals} tabungan
                  </span>
                </div>
                <span className="text-[10px] text-muted shrink-0 whitespace-nowrap">
                  {new Date(ws.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Users ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <SectionHeader title={`Users (${users.length})`} />
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <Card
              key={u.id}
              padding="sm"
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent select-none">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
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
              </div>
              <div className="flex items-center gap-2.5 text-[11px] text-muted shrink-0">
                <span>{u.ownedWorkspaces} WS</span>
                <span className="text-border-subtle">·</span>
                <span>{u.memberOf} anggota</span>
                <span className="text-border-subtle">·</span>
                <span>{u.transactions} tx</span>
                <span className="text-border-subtle">·</span>
                <span>
                  {new Date(u.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
