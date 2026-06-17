"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, RefreshCw } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  developerService,
  type DeveloperUser,
} from "@/services/developer.service";
import { formatRelativeTime } from "@/utils/format-date";

const PAGE_SIZE = 10;

export default function DeveloperUsersPage() {
  const [users, setUsers] = useState<DeveloperUser[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async (targetPage: number) => {
    setError(null);
    try {
      const res = await developerService.listUsers(targetPage, PAGE_SIZE);
      setUsers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(res.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data users");
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(page);
    setRefreshing(false);
  };

  const columns: DataTableColumn<DeveloperUser>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Pengguna",
        render: (u) => (
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent select-none">
              {u.name.charAt(0).toUpperCase()}
            </span>
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {u.name}
              </span>
              {u.role === "developer" && (
                <Chip tone="accent" size="sm">
                  DEV
                </Chip>
              )}
            </span>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        hideOnMobile: true,
        render: (u) => (
          <span className="text-sm text-muted truncate block max-w-[260px]">
            {u.email}
          </span>
        ),
      },
      {
        key: "role",
        header: "Role",
        hideOnMobile: true,
        render: (u) =>
          u.role === "developer" ? (
            <Chip tone="accent" size="sm">
              Developer
            </Chip>
          ) : (
            <Chip tone="neutral" size="sm">
              User
            </Chip>
          ),
      },
      {
        key: "transactions",
        header: "Transaksi",
        align: "right",
        render: (u) => (
          <span className="text-sm font-medium text-foreground tabular-nums">
            {u.transactions.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        key: "lastSeenAt",
        header: "Terakhir Dilihat",
        hideOnMobile: true,
        render: (u) => (
          <span className="text-xs text-muted">
            {formatRelativeTime(u.lastSeenAt)}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Tgl Daftar",
        align: "right",
        render: (u) => (
          <span className="text-xs text-muted">
            {new Date(u.createdAt).toLocaleDateString("id-ID", {
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
            <Users className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Users
            </h1>
            <p className="text-xs text-muted">{total} total pengguna</p>
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

      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(u) => u.id}
        pagination={{ page, pageSize: PAGE_SIZE, total, totalPages }}
        onPageChange={setPage}
        emptyTitle="Belum ada user"
        emptyDescription="Belum ada pengguna yang terdaftar."
      />
    </div>
  );
}
