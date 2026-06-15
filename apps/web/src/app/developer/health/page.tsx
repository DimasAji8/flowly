"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  RefreshCw,
  Server,
  Database,
  Clock,
  Cpu,
  Globe,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  developerService,
  type DeveloperHealth,
} from "@/services/developer.service";

function InfoRow({
  icon: Icon,
  label,
  value,
  color = "text-muted",
}: {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft ${color}`}
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div>
        <p className="text-[11px] text-muted font-medium">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-px">{value}</p>
      </div>
    </div>
  );
}

function HealthDot({ status }: { status: string }) {
  return (
    <span
      className={`inline-block size-1.5 rounded-full ${
        status === "healthy" ? "bg-emerald-500" : "bg-red-500"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHealth();
    setRefreshing(false);
  };

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

  if (!health) return null;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <Activity className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              System Health
            </h1>
            <p className="text-xs text-muted">
              Server & database diagnostic
            </p>
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

      {/* Status ringkasan */}
      <Card padding="md" className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow
            icon={Database}
            label="Database"
            value={
              <span className="flex items-center gap-1.5">
                <HealthDot status={health.database.status} />
                <span className="capitalize">{health.database.status}</span>
                {health.database.latencyMs !== null && (
                  <span className="text-xs text-muted font-normal">
                    {health.database.latencyMs}ms
                  </span>
                )}
              </span>
            }
            color="text-emerald-500"
          />
          <InfoRow
            icon={Clock}
            label="Uptime"
            value={`${Math.floor(health.uptime / 86400)}d ${Math.floor(
              (health.uptime % 86400) / 3600,
            )}h ${Math.floor((health.uptime % 3600) / 60)}m`}
            color="text-blue-500"
          />
          <InfoRow
            icon={Cpu}
            label="Memory"
            value={`${Math.round(
              health.memory.heapUsed / 1024 / 1024,
            )}MB / ${Math.round(health.memory.heapTotal / 1024 / 1024)}MB`}
            color="text-amber-500"
          />
          <InfoRow
            icon={Server}
            label="Node.js"
            value={health.nodeVersion}
            color="text-violet-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted border-t border-border-subtle pt-4">
          <Globe className="size-3.5" strokeWidth={2} />
          Platform: {health.platform}
        </div>
      </Card>

      {/* Detail memory */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          Memory Detail
        </h2>
        <Card padding="md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-muted font-medium">Heap Used</p>
              <p className="text-base font-semibold text-foreground tabular-nums mt-0.5">
                {Math.round(health.memory.heapUsed / 1024 / 1024)} MB
              </p>
            </div>
            <div>
              <p className="text-xs text-muted font-medium">Heap Total</p>
              <p className="text-base font-semibold text-foreground tabular-nums mt-0.5">
                {Math.round(health.memory.heapTotal / 1024 / 1024)} MB
              </p>
            </div>
            <div>
              <p className="text-xs text-muted font-medium">RSS</p>
              <p className="text-base font-semibold text-foreground tabular-nums mt-0.5">
                {Math.round(health.memory.rss / 1024 / 1024)} MB
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
