"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Eye, EyeOff, Trash2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { reviewService, type Review } from "@/services/review.service";

export default function DeveloperReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setError(null);
    try {
      const data = await reviewService.findAll();
      setReviews(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat review",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await reviewService.toggleShow(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isShown: updated.isShown } : r)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengubah status",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await reviewService.remove(deleteTarget.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghapus review",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (error && reviews.length === 0) {
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
              Kelola testimoni pengguna ({reviews.length})
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

      {/* Empty state */}
      {reviews.length === 0 && (
        <Card padding="lg" className="text-center">
          <MessageSquare className="mx-auto size-10 text-muted mb-3" strokeWidth={1.5} />
          <p className="text-sm text-muted">Belum ada review.</p>
        </Card>
      )}

      {/* Review list */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} padding="md" className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
              {review.name.charAt(0).toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {review.name}
                </span>
                {/* Stars */}
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < review.rating ? "text-accent" : "text-border"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </span>
                {/* Shown badge */}
                <span
                  className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    review.isShown
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {review.isShown ? "Ditampilkan" : "Disembunyikan"}
                </span>
              </div>
              <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                "{review.content}"
              </p>
              <p className="text-[11px] text-muted mt-1.5">
                {new Date(review.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleToggle(review.id)}
                className="grid size-8 place-items-center rounded-lg text-muted hover:bg-card-subtle hover:text-accent transition-colors"
                title={review.isShown ? "Sembunyikan" : "Tampilkan"}
              >
                {review.isShown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(review)}
                className="grid size-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                title="Hapus"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

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
