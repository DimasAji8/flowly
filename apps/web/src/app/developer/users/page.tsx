"use client";

import { useEffect, useState } from "react";
import { Users, RefreshCw, Shield, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  developerService,
  type DeveloperUser,
} from "@/services/developer.service";

export default function DeveloperUsersPage() {
  const [users, setUsers] = useState<DeveloperUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    setError(null);
    try {
      const data = await developerService.listUsers();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data users",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-40" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
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
            <Users className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Users
            </h1>
            <p className="text-xs text-muted">{users.length} total pengguna</p>
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

      {/* List */}
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
                <span className="text-xs text-muted truncate">{u.email}</span>
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
    </div>
  );
}
