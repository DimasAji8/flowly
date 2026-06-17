"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { reviewService, type Review } from "@/services/review.service";

const PAGE_SIZE = 10;

export default function DeveloperReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = useCallback(async (targetPage: number) => {
    setError(null);
    try {
      const res = await reviewService.findAll(targetPage, PAGE_SIZE);
      setReviews(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(res.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat review");
      setReviews([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews(page);
  }, [page, fetchReviews]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReviews(page);
    setRefreshing(false);
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await reviewService.toggleShow(id);
      setReviews((prev) =>
        prev
          ? prev.map((r) =>
              r.id === id ? { ...r, isShown: updated.isShown } : r,
            )
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await reviewService.remove(deleteTarget.id);
      setDeleteTarget(null);
      // Refresh list to reflect new total
      await fetchReviews(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus review");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: DataTableColumn<Review>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Pengguna",
        render: (r) => (
          <div className="flex items-start gap-3 min-w-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent select-none">
              {r.name.charAt(0).toUpperCase()}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {r.name}
              </span>
              <span
                className="flex gap-0.5 mt-0.5"
                aria-label={`Rating ${r.rating} dari 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-[10px] leading-none ${
                      i < r.rating ? "text-accent" : "text-border"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "content",
        header: "Review",
        render: (r) => (
          <p className="text-sm text-secondary leading-snug line-clamp-2 max-w-[420px]">
            &ldquo;{r.content}&rdquo;
          </p>
        ),
      },
      {
        key: "isShown",
        header: "Status",
        align: "center",
        render: (r) =>
          r.isShown ? (
            <Chip tone="success" size="sm">
              Ditampilkan
            </Chip>
          ) : (
            <Chip tone="danger" size="sm">
              Disembunyikan
            </Chip>
          ),
      },
      {
        key: "createdAt",
        header: "Tanggal",
        align: "right",
        hideOnMobile: true,
        render: (r) => (
          <span className="text-xs text-muted">
            {new Date(r.createdAt).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Aksi",
        align: "right",
        render: (r) => (
          <div className="inline-flex items-center gap-1 justify-end">
            <button
              type="button"
              onClick={() => handleToggle(r.id)}
              className="grid size-8 place-items-center rounded-lg text-muted hover:bg-card-subtle hover:text-accent transition-colors"
              title={r.isShown ? "Sembunyikan" : "Tampilkan"}
            >
              {r.isShown ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(r)}
              className="grid size-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
              title="Hapus"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  // ── Error total (tidak ada data) ────────────────────────────────────
  if (error && total === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="size-5 text-accent" strokeWidth={2} />
          <h1 className="text-lg font-semibold text-foreground">Reviews</h1>
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
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <MessageSquare className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Reviews
            </h1>
            <p className="text-xs text-muted">
              Kelola testimoni pengguna ({total})
            </p>
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

      {/* Error inline */}
      {error && (
        <div className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <DataTable
        data={reviews}
        columns={columns}
        keyExtractor={(r) => r.id}
        pagination={{ page, pageSize: PAGE_SIZE, total, totalPages }}
        onPageChange={setPage}
        emptyTitle="Belum ada review"
        emptyDescription="Belum ada testimoni yang masuk."
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Review"
        description={
          deleteTarget
            ? `Yakin ingin menghapus review dari "${deleteTarget.name}"?`
            : ""
        }
        confirmLabel="Hapus"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
