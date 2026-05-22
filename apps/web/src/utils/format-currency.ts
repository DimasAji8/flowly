/**
 * Format jumlah uang ke string ringkas. Default Rupiah, locale id-ID.
 * Input bisa string (dari Decimal API) atau number.
 */
export function formatCurrency(
  value: string | number,
  options: { compact?: boolean; currency?: string } = {},
): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "—";

  const currency = options.currency ?? "IDR";
  if (options.compact && Math.abs(num) >= 1_000_000) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(num);
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format jumlah tanpa simbol mata uang (untuk diff list, dengan + / − manual).
 */
export function formatAmount(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
    Math.abs(num),
  );
}
