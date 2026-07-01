const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTHS_SHORT_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** "2026-05-22" → "22 Mei 2026" */
export function formatDateLong(dateString: string): string {
  const [y, m, d] = dateString.split("-").map(Number);
  if (!y || !m || !d) return dateString;
  return `${d} ${MONTHS_ID[m - 1]} ${y}`;
}

/** "2026-05-22" → "22 Mei" */
export function formatDateShort(dateString: string): string {
  const [, m, d] = dateString.split("-").map(Number);
  if (!m || !d) return dateString;
  return `${d} ${MONTHS_SHORT_ID[m - 1]}`;
}

/** "2026-05-22" → "22 Mei 2026" */
export function formatDateMedium(dateString: string): string {
  const [y, m, d] = dateString.split("-").map(Number);
  if (!y || !m || !d) return dateString;
  return `${d} ${MONTHS_SHORT_ID[m - 1]} ${y}`;
}

/** Untuk header bulan: tahun & bulan (1..12) → "Mei 2026" */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS_ID[month - 1] ?? ""} ${year}`;
}

/** YYYY-MM-DD untuk hari ini di local timezone (untuk default form input). */
export function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Alias yang lebih ringkas. */
export function isoToday(): string {
  return todayIsoDate();
}

/**
 * "2026-05-22" → format relatif dalam Bahasa Indonesia
 * - Hari ini / Kemarin
 * - 2–6 hari lalu → "X hari lalu"
 * - ≥ 7 hari → "22 Mei 2026"
 */
export function formatRelativeDate(dateString: string): string {
  const [y, m, d] = dateString.split("-").map(Number);
  if (!y || !m || !d) return dateString;

  const now = new Date();
  const target = new Date(y, m - 1, d);
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((todayMidnight.getTime() - target.getTime()) / 86_400_000);

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays >= 2 && diffDays <= 6) return `${diffDays} hari lalu`;
  return `${d} ${MONTHS_ID[m - 1]} ${y}`;
}

/**
 * ISO datetime → format relatif dalam Bahasa Indonesia.
 * - < 1 menit  → "Baru saja"
 * - < 1 jam    → "X menit lalu"
 * - < 24 jam   → "X jam lalu"
 * - < 7 hari   → "X hari lalu"
 * - ≥ 7 hari   → "22 Mei 2026"
 */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "Belum pernah";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;

  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${d} ${MONTHS_ID[m - 1]} ${y}`;
}

/** Range bulan ini sebagai YYYY-MM-DD. */
export function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-based
  const fromDate = new Date(y, m, 1);
  const toDate = new Date(y, m + 1, 0); // last day of current month
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  return { from: fmt(fromDate), to: fmt(toDate) };
}
