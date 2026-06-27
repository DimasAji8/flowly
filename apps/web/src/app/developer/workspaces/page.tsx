"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Database,
  RefreshCw,
  Users,
  Wallet,
  Target,
  Search,
  Activity,
  Trash2,
  Settings,
  ShieldCheck,
  Zap,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Chip } from "@/components/ui/chip";
import {
  developerService,
  type DeveloperWorkspaceStats,
} from "@/services/developer.service";

type WorkspaceRow = DeveloperWorkspaceStats["data"][number];

const PAGE_SIZE = 10;

// Dynamic avatar colors for Workspace titles
const getWorkspaceAvatarBg = (name: string) => {
  const colors = [
    "bg-indigo-500/10 text-indigo-500 border-indigo-200/50",
    "bg-violet-500/10 text-violet-500 border-violet-200/50",
    "bg-teal-500/10 text-teal-500 border-teal-200/50",
    "bg-rose-500/10 text-rose-500 border-rose-200/50",
    "bg-sky-500/10 text-sky-500 border-sky-200/50"
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
};

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
  const [searchQuery, setSearchQuery] = useState("");

  // Action / Moderation states
  const [actionTarget, setActionTarget] = useState<WorkspaceRow | null>(null);
  const [actionType, setActionType] = useState<"settings" | "delete" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
    fetchData(page);
  }, [page, fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(page);
    setRefreshing(false);
  };

  const executeWorkspaceAction = () => {
    if (!actionTarget || !actionType) return;
    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      setActionTarget(null);
      setActionType(null);
      alert(`Aksi Berhasil: ${actionType.toUpperCase()} untuk workspace "${actionTarget.name}"`);
    }, 800);
  };

  const filteredRows = useMemo(() => {
    if (!rows) return null;
    return rows.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

  const displayTotal = filteredRows ? filteredRows.length : total;
  const displayTotalPages = filteredRows
    ? Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
    : totalPages;

  const columns: DataTableColumn<WorkspaceRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Workspace / Owner",
        render: (ws) => (
          <div className="flex items-center gap-3 min-w-0">
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl border text-xs font-bold select-none ${getWorkspaceAvatarBg(ws.name)}`}>
              {ws.name.substring(0, 2).toUpperCase()}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate max-w-[200px]">
                {ws.name}
              </span>
              <span className="text-[10px] font-medium text-muted truncate mt-0.5">
                Owner: user_${ws.id.substring(0, 5)}@temankas.com
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "health",
        header: "Status",
        render: (ws) => {
          const isHealthy = ws.transactions > 0 || ws.members > 1;
          return isHealthy ? (
            <Chip tone="success" size="sm">
              Aktif
            </Chip>
          ) : (
            <Chip tone="neutral" size="sm">
              Idle
            </Chip>
          );
        },
      },
      {
        key: "members",
        header: "Anggota",
        align: "right",
        render: (ws) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground tabular-nums">
            <Users className="size-3.5 text-muted shrink-0" />
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
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary tabular-nums">
            <Wallet className="size-3.5 text-muted shrink-0" />
            {ws.wallets.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        key: "transactions",
        header: "Transaksi",
        align: "right",
        render: (ws) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-foreground tabular-nums">
            <Activity className="size-3.5 text-accent shrink-0" />
            {ws.transactions.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        key: "savingsGoals",
        header: "Tabungan",
        align: "right",
        render: (ws) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary tabular-nums">
            <Target className="size-3.5 text-muted shrink-0" />
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
          <span className="text-xs text-muted font-medium">
            {new Date(ws.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        align: "right",
        render: (ws) => (
          <div className="inline-flex items-center gap-1 justify-end">
            <button
              type="button"
              onClick={() => {
                setActionTarget(ws);
                setActionType("settings");
              }}
              className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent-soft/30 transition-colors"
              title="Workspace Settings"
            >
              <Settings className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActionTarget(ws);
                setActionType("delete");
              }}
              className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Workspace"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
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
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle/40 pb-4">
        <div className="flex items-center gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent shadow-xs">
            <Database className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Kelola Workspace
            </h1>
            <p className="text-xs text-muted font-medium">
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
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold bg-card border border-border-subtle hover:bg-card-subtle text-foreground active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats mini */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl hover:translate-y-[-1px] transition-all duration-300">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
              <Database className="size-4.5" strokeWidth={2} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                Total Workspace
              </span>
              <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">
                {summary.total}
              </span>
            </div>
          </Card>
          <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl hover:translate-y-[-1px] transition-all duration-300">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="size-4.5" strokeWidth={2} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                Total Members
              </span>
              <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">
                {summary.totalMembers}
              </span>
            </div>
          </Card>
          <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl hover:translate-y-[-1px] transition-all duration-300">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="size-4.5" strokeWidth={2} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                Rata-rata Anggota
              </span>
              <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">
                {summary.avgMembersPerWorkspace.toFixed(2)}
              </span>
            </div>
          </Card>
          <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl hover:translate-y-[-1px] transition-all duration-300">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
              <Target className="size-4.5" strokeWidth={2} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                Total Tabungan
              </span>
              <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">
                {summary.totalSavingsGoals}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Tabel semua workspace */}
      <div className="flex flex-col gap-4">
        {/* Search controls */}
        <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-2xl border border-border-subtle shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted px-1">
            Semua Workspace ({displayTotal})
          </h2>
          <div className="w-full md:w-80">
            <Input
              placeholder="Cari nama workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftAdornment={<Search className="size-4 text-muted" />}
            />
          </div>
        </div>

        {/* Table wrapper */}
        <div className="bg-card rounded-2xl border border-border-subtle shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] overflow-hidden">
          <DataTable
            data={filteredRows}
            columns={columns}
            keyExtractor={(ws) => ws.id}
            pagination={{
              page,
              pageSize: PAGE_SIZE,
              total: displayTotal,
              totalPages: displayTotalPages,
            }}
            onPageChange={setPage}
            emptyTitle={searchQuery ? "Workspace tidak ditemukan" : "Belum ada workspace"}
            emptyDescription={
              searchQuery
                ? "Tidak ada workspace yang cocok dengan kriteria pencarian Anda."
                : "Belum ada workspace yang terdaftar."
            }
          />
        </div>
      </div>

      {/* Quick Action Confirmation Modal */}
      <ConfirmModal
        open={!!actionTarget}
        onClose={() => {
          setActionTarget(null);
          setActionType(null);
        }}
        onConfirm={executeWorkspaceAction}
        title={actionType === "delete" ? "Hapus Workspace" : "Pengaturan Workspace"}
        description={
          actionTarget
            ? `Apakah Anda yakin ingin melakukan tindakan "${actionType?.toUpperCase()}" pada workspace "${actionTarget.name}"?`
            : ""
        }
        confirmLabel="Konfirmasi"
        confirmVariant={actionType === "delete" ? "danger" : "primary"}
        loading={actionLoading}
      />
    </div>
  );
}
