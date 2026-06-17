"use client";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// ---------------------------------------------------------------------------
// Column definition
// ---------------------------------------------------------------------------
export interface DataTableColumn<T> {
  /** Unique key (React render key + accessor fallback) */
  key: string;
  /** Header label */
  header: string;
  /** Apply to both <th> and <td> */
  className?: string;
  /** Cell text alignment (header follows) */
  align?: "left" | "right" | "center";
  /** Hide on small screens, show on md+ */
  hideOnMobile?: boolean;
  /** Custom cell renderer; falls back to item[key] if omitted */
  render?: (item: T, index: number) => React.ReactNode;
}

// ---------------------------------------------------------------------------
// Pagination shape (server-side)
// ---------------------------------------------------------------------------
export interface DataTablePagination {
  page: number; // 1-indexed
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DataTableProps<T> {
  /** Baris pada halaman saat ini. `null` = loading. */
  data: T[] | null;
  columns: DataTableColumn<T>[];
  /** React key extractor for each row */
  keyExtractor: (item: T) => string;
  /** Server-side pagination info. Required saat `data` adalah array. */
  pagination?: DataTablePagination;
  /** Called saat user ganti halaman (server-side mode) */
  onPageChange?: (page: number) => void;
  /** Loading rows count (default 6) */
  loadingRows?: number;
  /** Tampilkan kolom "No." otomatis (1-indexed by pagination.page) */
  showIndex?: boolean;
  /** Lebar kolom "No." (default 56px / w-12) */
  indexWidth?: string;
  /** Title untuk empty state */
  emptyTitle?: string;
  /** Description untuk empty state */
  emptyDescription?: string;
}

// ---------------------------------------------------------------------------
// DataTable — table + server-side pagination, wrapped in Card
// ---------------------------------------------------------------------------
export function DataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  pagination,
  onPageChange,
  loadingRows = 6,
  showIndex = true,
  indexWidth = "w-12",
  emptyTitle = "Belum ada data",
  emptyDescription,
}: DataTableProps<T>) {
  const isLoading = data === null;
  const rows = data ?? [];
  const total = pagination?.total ?? 0;
  const pageSize = pagination?.pageSize ?? 10;
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const hasPagination = !isLoading && totalPages > 1 && onPageChange;

  // Pagination items: 1, 2, ..., N dengan ellipsis
  const buildPageItems = (): Array<number | "ellipsis"> => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: Array<number | "ellipsis"> = [1];
    if (currentPage > 3) items.push("ellipsis");
    const from = Math.max(2, currentPage - 1);
    const to = Math.min(totalPages - 1, currentPage + 1);
    for (let i = from; i <= to; i++) items.push(i);
    if (currentPage < totalPages - 2) items.push("ellipsis");
    items.push(totalPages);
    return items;
  };

  // ── Empty state (hanya tampil jika bukan loading & total = 0) ──────────
  if (!isLoading && total === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        {emptyDescription && (
          <p className="mt-1 text-xs text-muted">{emptyDescription}</p>
        )}
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table card */}
      <Card variant="default" padding="none" className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card-subtle hover:bg-card-subtle border-b border-border-subtle">
              {showIndex && (
                <TableHead
                  className={cn(
                    "h-10 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted",
                    indexWidth,
                  )}
                >
                  No.
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-10 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.hideOnMobile && "hidden md:table-cell",
                    col.className,
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <TableRow
                  key={`skel-${i}`}
                  className="border-b border-border-subtle/60"
                >
                  {showIndex && (
                    <TableCell className={cn("px-4 py-3", indexWidth)}>
                      <Skeleton className="h-3 w-6" />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "px-4 py-3",
                        col.hideOnMobile && "hidden md:table-cell",
                      )}
                    >
                      <Skeleton className="h-3 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              rows.map((item, i) => (
                <TableRow
                  key={keyExtractor(item)}
                  className="border-b border-border-subtle/60 last:border-b-0"
                >
                  {showIndex && (
                    <TableCell
                      className={cn(
                        "px-4 py-3 text-xs text-muted tabular-nums",
                        indexWidth,
                      )}
                    >
                      {start + i + 1}
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-sm",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.hideOnMobile && "hidden md:table-cell",
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(item, start + i)
                        : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination footer */}
      {!isLoading && total > 0 && (
        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted tabular-nums">
            {start + 1}–{end} dari {total}
          </p>
          {hasPagination && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    text="Sebelumnya"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) onPageChange!(currentPage - 1);
                    }}
                    className={cn(
                      currentPage === 1 && "pointer-events-none opacity-40",
                    )}
                  />
                </PaginationItem>

                {buildPageItems().map((p, i) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange!(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    text="Berikutnya"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        onPageChange!(currentPage + 1);
                    }}
                    className={cn(
                      currentPage === totalPages &&
                        "pointer-events-none opacity-40",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
