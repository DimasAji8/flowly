/**
 * Generic response shape untuk endpoint list yang di-paginate.
 *
 * - `data`       : baris pada halaman saat ini
 * - `total`      : jumlah total baris (di semua halaman)
 * - `page`       : halaman saat ini (1-indexed, sudah di-clamp)
 * - `pageSize`   : jumlah baris per halaman (sudah di-clamp)
 * - `totalPages` : Math.ceil(total / pageSize), minimal 1
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Helper untuk membangun PaginatedResponse dari hasil Prisma.
 *
 * @param data     hasil `findMany` dengan `skip` & `take`
 * @param total    hasil `count` tanpa filter pagination
 * @param page     page (1-indexed)
 * @param pageSize pageSize
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  return {
    data,
    total,
    page: safePage,
    pageSize: safeSize,
    totalPages,
  };
}
