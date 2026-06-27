"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Select } from "@/components/ui/select";
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
  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all");

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
      await fetchReviews(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus review");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Computed Rating Distribution & Sentiments ────────────────────────
  const reviewStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        average: "0.0",
        totalCount: 0,
        positivePct: 0,
        distribution: [0, 0, 0, 0, 0], // counts for 1, 2, 3, 4, 5 stars
        hiddenCount: 0,
      };
    }

    let sum = 0;
    const distribution = [0, 0, 0, 0, 0];
    let positiveCount = 0;
    let hidden = 0;

    for (const r of reviews) {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating - 1]++;
      }
      if (r.rating >= 4) {
        positiveCount++;
      }
      if (!r.isShown) {
        hidden++;
      }
    }

    const average = (sum / reviews.length).toFixed(1);
    const positivePct = Math.round((positiveCount / reviews.length) * 100);

    return {
      average,
      totalCount: reviews.length,
      positivePct,
      distribution,
      hiddenCount: hidden,
    };
  }, [reviews]);

  // Client-side filtering by rating
  const filteredReviews = useMemo(() => {
    if (!reviews) return null;
    if (ratingFilter === "all") return reviews;
    const targetRating = parseInt(ratingFilter, 10);
    return reviews.filter((r) => r.rating === targetRating);
  }, [reviews, ratingFilter]);

  const isFiltered = ratingFilter !== "all";

  const displayTotal = isFiltered && filteredReviews ? filteredReviews.length : total;
  const displayTotalPages = isFiltered && filteredReviews
    ? Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE))
    : totalPages;

  const columns: DataTableColumn<Review>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Pengguna",
        render: (r) => (
          <div className="flex items-start gap-3 min-w-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent select-none border border-accent/20">
              {r.name.charAt(0).toUpperCase()}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate max-w-[200px]">
                {r.name}
              </span>
              <span
                className="flex gap-0.5 mt-1"
                aria-label={`Rating ${r.rating} dari 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3 ${
                      i < r.rating ? "text-amber-500 fill-amber-500" : "text-border"
                    }`}
                  />
                ))}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "content",
        header: "Review / Komentar",
        render: (r) => (
          <p className="text-sm text-secondary leading-relaxed max-w-[420px] font-medium">
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
          <span className="text-xs text-muted font-semibold">
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
        header: "Aksi Moderasi",
        align: "right",
        render: (r) => (
          <div className="inline-flex items-center gap-1 justify-end">
            <button
              type="button"
              onClick={() => handleToggle(r.id)}
              className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent-soft/30 transition-colors"
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
              className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Hapus Review"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

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
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle/40 pb-4">
        <div className="flex items-center gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent shadow-xs">
            <MessageSquare className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Moderasi Ulasan (Reviews)
            </h1>
            <p className="text-xs text-muted font-medium">
              Kelola testimoni pengguna yang tampil di halaman landing
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

      {/* Error inline */}
      {error && (
        <div className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger border border-danger-soft/80">
          {error}
        </div>
      )}

      {/* ── Summary & Sentiment Dashboard ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Rating Breakdown & Stats */}
        <Card padding="lg" className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Star className="size-4 text-amber-500 fill-amber-500" />
            Rata-rata Rating
          </span>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-4xl font-black text-foreground tabular-nums tracking-tight">
              {reviewStats.average}
            </span>
            <span className="text-sm font-semibold text-muted">/ 5.0</span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4.5 ${
                  i < Math.round(parseFloat(reviewStats.average))
                    ? "text-amber-500 fill-amber-500"
                    : "text-border"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted font-medium mt-1">
            Dihitung dari {reviewStats.totalCount} ulasan yang masuk di database.
          </p>
        </Card>

        {/* Sentiment Analysis */}
        <Card padding="lg" className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <ThumbsUp className="size-4 text-emerald-500" />
            Sentimen Ulasan
          </span>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-4xl font-black text-foreground tabular-nums tracking-tight">
              {reviewStats.positivePct}%
            </span>
            <span className="text-sm font-semibold text-muted">Sentimen Positif</span>
          </div>
          {/* Subtle Progress Bar */}
          <div className="h-2.5 w-full bg-card-subtle border border-border-subtle/50 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${reviewStats.positivePct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted font-bold mt-1">
            <span className="flex items-center gap-1 text-emerald-600">
              <ThumbsUp className="size-3" /> {reviewStats.positivePct}% Positif
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <ThumbsDown className="size-3" /> {100 - reviewStats.positivePct}% Negatif/Netral
            </span>
          </div>
        </Card>

        {/* Rating Distribution Chart */}
        <Card padding="lg" className="flex flex-col gap-4 border border-border-subtle bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <AlertCircle className="size-4 text-blue-500" />
            Status & Moderasi
          </span>
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Ulasan Disembunyikan</span>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200/50 px-2.5 py-0.5 rounded-full">
                {reviewStats.hiddenCount} Pending
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Ulasan Ditampilkan</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">
                {reviewStats.totalCount - reviewStats.hiddenCount} Live
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Total Moderasi Masuk</span>
              <span className="text-xs font-bold text-foreground bg-card-subtle border border-border-subtle/50 px-2.5 py-0.5 rounded-full">
                {reviewStats.totalCount}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Table & Filter Area ────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Rating Filter Control */}
        <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-2xl border border-border-subtle shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted px-1">
            Ulasan Pengguna ({displayTotal})
          </h2>
          <div className="w-full md:w-56">
            <Select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as any)}
              options={[
                { value: "all", label: "Semua Rating" },
                { value: "5", label: "5 Bintang (★★★★★)" },
                { value: "4", label: "4 Bintang (★★★★)" },
                { value: "3", label: "3 Bintang (★★★)" },
                { value: "2", label: "2 Bintang (★★)" },
                { value: "1", label: "1 Bintang (★)" },
              ]}
            />
          </div>
        </div>

        {/* Table wrapper */}
        <div className="bg-card rounded-2xl border border-border-subtle shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] overflow-hidden">
          <DataTable
            data={filteredReviews}
            columns={columns}
            keyExtractor={(r) => r.id}
            pagination={{
              page,
              pageSize: PAGE_SIZE,
              total: displayTotal,
              totalPages: displayTotalPages,
            }}
            onPageChange={setPage}
            emptyTitle={ratingFilter !== "all" ? "Ulasan tidak ditemukan" : "Belum ada review"}
            emptyDescription={
              ratingFilter !== "all"
                ? "Tidak ada testimoni dengan rating tersebut."
                : "Belum ada testimoni yang masuk."
            }
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Review"
        description={
          deleteTarget
            ? `Apakah Anda yakin ingin menghapus review dari "${deleteTarget.name}" secara permanen dari sistem?`
            : ""
        }
        confirmLabel="Hapus"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
