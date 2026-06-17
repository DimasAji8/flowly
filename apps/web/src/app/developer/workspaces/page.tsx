"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Database,
  RefreshCw,
  Users,
  Wallet,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  developerService,
  type DeveloperWorkspaceStats,
} from "@/services/developer.service";

type WorkspaceRow = DeveloperWorkspaceStats["data"][number];

const PAGE_SIZE = 10;

export default function DeveloperWorkspacesPage() {
  const [rows, setRows] = useState<WorkspaceRow[] | null>(null);
  const [summary, setSummary] = useState<Omit<
    DeveloperWorkspaceStats,
    "data"
  > | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (targetPage: number) => {
    setError(null);
    try {
      const res = await developerService.getWorkspaceStats(
        targetPage,
        PAGE_SIZE,
      );
      const {
        data: list,
        total: t,
        totalPages: tp,
        page: p,
        pageSize: _ps,
        ...rest
      } = res;
      setRows(list);
      setSummary({ ...rest, total: t, totalPages: tp, page: p, pageSize: _ps });
      setTotal(t);
      setTotalPages(tp);
      setPage(p);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data workspace",
      );
      setRows([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(page);
  }, [page, fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(page);
    setRefreshing(false);
  };

  const columns: DataTableColumn<WorkspaceRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Nama",
        render: (ws) => (
          <span className="text-sm font-medium text-foreground truncate block max-w-[240px]">
            {ws.name}
          </span>
        ),
      },
      {
        key: "members",
        header: "Anggota",
        align: "right",
        render: (ws) => (
          <span className="text-sm text-foreground tabular-nums">
            {ws.members.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        key: "wallets",
        header: "Dompet",
        align: "right",
        hideOnMobile: true,
        render: (ws) => (
          <span className="text-sm text-secondary tabular-nums">
            {ws.wallets.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        key: "categories",
        header: "Kategori",
        align: "right",
        hideOnMobile: true,
        render: (ws) => (
          <span className="text-sm text-secondary tabular-nums">
            {ws.categories.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        key: "transactions",
        header: "Transaksi",
        align: "right",
        render: (ws) => (
          <span className="text-sm font-medium text-foreground tabular-nums">
            {ws.transactions.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        key: "savingsGoals",
        header: "Tabungan",
        align: "right",
        render: (ws) => (
          <span className="text-sm text-secondary tabular-nums">
            {ws.savingsGoals.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Dibuat",
        align: "right",
        hideOnMobile: true,
        render: (ws) => (
          <span className="text-xs text-muted">
            {new Date(ws.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
    ],
    [],
  );

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
              {summary
                ? `${summary.total} total · rata-rata ${summary.avgMembersPerWorkspace.toFixed(1)} anggota`
                : "Memuat..."}
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
      {summary && (
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
                  {summary.total}
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
                  {summary.totalMembers}
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
                  {summary.avgMembersPerWorkspace.toFixed(2)}
                </span>
              </div>
            </Card>
            <Card padding="md" className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-rose-500">
                <Target className="size-4.5" strokeWidth={2} />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-muted font-medium">
                  Total Tabungan
                </span>
                <span className="text-base font-semibold text-foreground tabular-nums">
                  {summary.totalSavingsGoals}
                </span>
              </div>
            </Card>
          </div>

          {/* Tabel semua workspace */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Semua Workspace
            </h2>
            <DataTable
              data={rows}
              columns={columns}
              keyExtractor={(ws) => ws.id}
              pagination={{ page, pageSize: PAGE_SIZE, total, totalPages }}
              onPageChange={setPage}
              emptyTitle="Belum ada workspace"
              emptyDescription="Belum ada workspace yang terdaftar."
            />
          </div>
        </>
      )}
    </div>
  );
}
