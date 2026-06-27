"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, RefreshCw, Search, Shield, UserPlus, UserCheck, Trash2, ShieldAlert, Ban, Edit2 } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  developerService,
  type DeveloperUser,
  type DeveloperStats,
} from "@/services/developer.service";
import { formatRelativeTime } from "@/utils/format-date";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 10;

// Dynamic avatar styling based on user name character sum
const getAvatarColor = (name: string) => {
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

export default function DeveloperUsersPage() {
  const [users, setUsers] = useState<DeveloperUser[] | null>(null);
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "developer" | "user">("all");

  // Moderation / Action states
  const [actionTarget, setActionTarget] = useState<DeveloperUser | null>(null);
  const [actionType, setActionType] = useState<"role" | "suspend" | "delete" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async (targetPage: number) => {
    setError(null);
    try {
      const [res, s] = await Promise.all([
        developerService.listUsers(targetPage, PAGE_SIZE),
        developerService.getStats()
      ]);
      setUsers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(res.page);
      setStats(s);
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

  const executeUserAction = async () => {
    if (!actionTarget || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === "delete") {
        await developerService.deleteUser(actionTarget.id);
        toast.success(`Pengguna "${actionTarget.name}" berhasil dihapus`);
      } else if (actionType === "suspend") {
        await developerService.toggleUserSuspension(actionTarget.id);
        toast.success(
          `Pengguna "${actionTarget.name}" berhasil ${actionTarget.isSuspended ? "diaktifkan" : "ditangguhkan"}`
        );
      } else if (actionType === "role") {
        const newRole = actionTarget.role === "developer" ? "user" : "developer";
        await developerService.updateUserRole(actionTarget.id, newRole);
        toast.success(`Role pengguna "${actionTarget.name}" berhasil diubah menjadi ${newRole.toUpperCase()}`);
      }
      
      // Refresh the page data
      await fetchUsers(page);
      
      setActionTarget(null);
      setActionType(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengeksekusi aksi");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return null;
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "developer" && u.role === "developer") ||
        (roleFilter === "user" && u.role === "user");
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const isFiltered = searchQuery !== "" || roleFilter !== "all";

  const displayTotal = isFiltered && filteredUsers ? filteredUsers.length : total;
  const displayTotalPages = isFiltered && filteredUsers
    ? Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
    : totalPages;

  // Compute Quick Stats
  const newUsersThisMonth = useMemo(() => {
    if (!users) return 0;
    const now = new Date();
    return users.filter((u) => {
      const d = new Date(u.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [users]);

  const developerCount = useMemo(() => {
    if (!users) return 0;
    return users.filter((u) => u.role === "developer").length;
  }, [users]);

  const columns: DataTableColumn<DeveloperUser>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Pengguna",
        render: (u) => (
          <div className="flex items-center gap-3 min-w-0">
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold select-none", getAvatarColor(u.name))}>
              {u.name.charAt(0).toUpperCase()}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate max-w-[150px] md:max-w-[200px] inline-flex items-center gap-1.5">
                {u.name}
                {u.isSuspended && (
                  <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-[9px] font-extrabold text-red-600 uppercase tracking-wide border border-red-200/20">
                    Suspended
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium text-muted truncate mt-0.5 md:hidden">
                {u.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        hideOnMobile: true,
        render: (u) => (
          <span className="text-sm text-secondary font-medium truncate block max-w-[220px]">
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
          <span className="text-sm font-bold text-foreground tabular-nums">
            {u.transactions.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        key: "lastSeenAt",
        header: "Terakhir Dilihat",
        hideOnMobile: true,
        render: (u) => (
          <span className="text-xs text-muted font-medium">
            {formatRelativeTime(u.lastSeenAt)}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Tgl Daftar",
        align: "right",
        render: (u) => (
          <span className="text-xs text-muted font-medium">
            {new Date(u.createdAt).toLocaleDateString("id-ID", {
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
        render: (u) => (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActionTarget(u);
                setActionType("role");
              }}
              className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent-soft/30 transition-colors"
              title="Edit Role"
            >
              <Edit2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActionTarget(u);
                setActionType("suspend");
              }}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                u.isSuspended
                  ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                  : "text-muted hover:text-amber-600 hover:bg-amber-50"
              )}
              title={u.isSuspended ? "Aktifkan User" : "Suspend User"}
            >
              <Ban className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActionTarget(u);
                setActionType("delete");
              }}
              className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Hapus User"
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
            <Users className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Kelola Pengguna
            </h1>
            <p className="text-xs text-muted font-medium">Monitoring aktivitas user dan konfigurasi role</p>
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

      {/* ── Quick Stats Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl hover:translate-y-[-1px] transition-all duration-300">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
            <Users className="size-4.5" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Total User</span>
            <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">{stats?.users ?? total}</span>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl hover:translate-y-[-1px] transition-all duration-300">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <UserCheck className="size-4.5" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">User Aktif (30d)</span>
            <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">{stats?.activeUsers30d ?? 0}</span>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl hover:translate-y-[-1px] transition-all duration-300">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
            <UserPlus className="size-4.5" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Baru Bulan Ini</span>
            <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">{newUsersThisMonth}</span>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3.5 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl hover:translate-y-[-1px] transition-all duration-300">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
            <Shield className="size-4.5" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Developers</span>
            <span className="text-base font-extrabold text-foreground tabular-nums mt-0.5">{developerCount}</span>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3.5 md:flex-row md:items-center bg-card p-4 rounded-2xl border border-border-subtle shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex-1">
          <Input
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftAdornment={<Search className="size-4 text-muted" />}
          />
        </div>
        <div className="w-full md:w-56">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            options={[
              { value: "all", label: "Semua Role" },
              { value: "developer", label: "Developer Only" },
              { value: "user", label: "User Only" },
            ]}
          />
        </div>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total: displayTotal,
          totalPages: displayTotalPages,
        }}
        onPageChange={setPage}
        emptyTitle={searchQuery || roleFilter !== "all" ? "User tidak ditemukan" : "Belum ada user"}
        emptyDescription={
          searchQuery || roleFilter !== "all"
            ? "Tidak ada pengguna yang cocok dengan kriteria pencarian Anda."
            : "Belum ada pengguna yang terdaftar."
        }
      />

      {/* Action Modal (Confirmation) */}
      <ConfirmModal
        open={!!actionTarget}
        onClose={() => {
          setActionTarget(null);
          setActionType(null);
        }}
        onConfirm={executeUserAction}
        title={
          actionType === "role"
            ? "Ubah Role Pengguna"
            : actionType === "suspend"
              ? (actionTarget?.isSuspended ? "Aktifkan Pengguna" : "Tangguhkan Pengguna")
              : "Hapus Pengguna"
        }
        description={
          actionTarget
            ? `Apakah Anda yakin ingin melakukan aksi "${
                actionType === "suspend"
                  ? (actionTarget.isSuspended ? "AKTIFKAN" : "TANGGUHKAN")
                  : actionType?.toUpperCase()
              }" untuk user "${actionTarget.name}" (${actionTarget.email})?`
            : ""
        }
        confirmLabel="Konfirmasi"
        confirmVariant={actionType === "delete" || (actionType === "suspend" && !actionTarget?.isSuspended) ? "danger" : "primary"}
        loading={actionLoading}
      />
    </div>
  );
}
