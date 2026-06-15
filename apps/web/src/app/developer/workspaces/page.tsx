"use client";

import { useEffect, useState } from "react";
import { Database, RefreshCw, Users, Wallet, Tag, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  developerService,
  type DeveloperWorkspaceStats,
} from "@/services/developer.service";

export default function DeveloperWorkspacesPage() {
  const [data, setData] = useState<DeveloperWorkspaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setError(null);
    try {
      const ws = await developerService.getWorkspaceStats();
      setData(ws);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data workspace",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
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

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <Database className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Workspaces
            </h1>
            <p className="text-xs text-muted">
              {data?.total ?? 0} total · rata-rata{" "}
              {data?.avgMembersPerWorkspace.toFixed(1)} anggota
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

      {/* Stats mini */}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card padding="md" className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-violet-500">
                <Database className="size-4.5" strokeWidth={2} />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-muted font-medium">
                  Total
                </span>
                <span className="text-base font-semibold text-foreground tabular-nums">
                  {data.total}
                </span>
              </div>
            </Card>
            <Card padding="md" className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-emerald-500">
                <Users className="size-4.5" strokeWidth={2} />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-muted font-medium">
                  Total Members
                </span>
                <span className="text-base font-semibold text-foreground tabular-nums">
                  {data.totalMembers}
                </span>
              </div>
            </Card>
            <Card padding="md" className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-amber-500">
                <Wallet className="size-4.5" strokeWidth={2} />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-muted font-medium">
                  Rata-rata Anggota
                </span>
                <span className="text-base font-semibold text-foreground tabular-nums">
                  {data.avgMembersPerWorkspace.toFixed(2)}
                </span>
              </div>
            </Card>
            <Card padding="md" className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-rose-500">
                <Target className="size-4.5" strokeWidth={2} />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-muted font-medium">
                  Total Savings
                </span>
                <span className="text-base font-semibold text-foreground tabular-nums">
                  {data.list.reduce((sum, ws) => sum + ws.savingsGoals, 0)}
                </span>
              </div>
            </Card>
          </div>

          {/* List */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Semua Workspace
            </h2>
            {data.list.map((ws) => (
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
        </>
      )}
    </div>
  );
}
