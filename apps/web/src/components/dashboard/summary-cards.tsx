import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";

type HeroTab = "assets" | "monthly";

interface SummaryCardsProps {
  income: string;
  expense: string;
  net: string;
  month: string;
  totalBalance?: number;
}

const STORAGE_KEY_HIDDEN = "teman-kas.balance-hidden";
const STORAGE_KEY_TAB = "teman-kas.hero-tab";

export function SummaryCards({ income, expense, net, month, totalBalance }: SummaryCardsProps) {
  const isLowBalance = totalBalance !== undefined && totalBalance < 500_000;
  const [hidden, setHidden] = useState(true);
  const [activeTab, setActiveTab] = useState<HeroTab>("assets");

  // Load preferences from localStorage
  useEffect(() => {
    const storedHidden = localStorage.getItem(STORAGE_KEY_HIDDEN);
    if (storedHidden !== null) {
      // setState di effect disengaja: localStorage hanya tersedia di klien (pasca-mount).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHidden(storedHidden === "true");
    }
    const storedTab = localStorage.getItem(STORAGE_KEY_TAB);
    if (storedTab === "assets" || storedTab === "monthly") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(storedTab);
    }
  }, []);

  const toggleHidden = () => {
    setHidden((h) => {
      const newValue = !h;
      localStorage.setItem(STORAGE_KEY_HIDDEN, String(newValue));
      return newValue;
    });
  };

  const switchTab = (tab: HeroTab) => {
    setActiveTab(tab);
    localStorage.setItem(STORAGE_KEY_TAB, tab);
  };

  const mask = "••••••";
  const netValue = Number(net);
  const isNetNegative = netValue < 0;

  const heroLabel = activeTab === "assets"
    ? "Total Saldo · semua dompet"
    : "Sisa bulan ini";

  const heroValue = activeTab === "assets"
    ? (totalBalance !== undefined ? formatCurrency(totalBalance) : "—")
    : formatCurrency(net);

  return (
    <div className="flex flex-col gap-3">
      {/* Hero card */}
      <div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: isLowBalance
            ? "linear-gradient(135deg, #4a1515 0%, #b91c1c 100%)"
            : "linear-gradient(135deg, #1a4731 0%, #15803d 100%)",
          boxShadow: isLowBalance
            ? "0 8px 32px -8px rgba(185, 28, 28, 0.45), 0 2px 8px rgba(0,0,0,0.12)"
            : "0 8px 32px -8px rgba(21, 128, 61, 0.45), 0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full opacity-10" style={{ background: "white" }} aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 -left-6 size-32 rounded-full opacity-10" style={{ background: "white" }} aria-hidden />
        <div className="pointer-events-none absolute right-16 bottom-4 size-20 rounded-full opacity-5" style={{ background: "white" }} aria-hidden />

        {/* Tab toggle + hide button */}
        <div className="flex items-center justify-between">
          <div className="flex rounded-full bg-white/10 p-0.5">
            <button
              type="button"
              onClick={() => switchTab("assets")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide transition-all ${
                activeTab === "assets"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              Total Aset
            </button>
            <button
              type="button"
              onClick={() => switchTab("monthly")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide transition-all ${
                activeTab === "monthly"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              Sisa Bulan
            </button>
          </div>
          <button
            type="button"
            onClick={toggleHidden}
            className="text-white/50 hover:text-white/80 transition-colors"
            aria-label={hidden ? "Tampilkan saldo" : "Sembunyikan saldo"}
          >
            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {/* Label */}
        <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
          {heroLabel}
        </p>

        {/* Hero value */}
        <p className={`mt-1.5 text-4xl font-bold tabular-nums tracking-tight drop-shadow-sm ${
          activeTab === "monthly" && isNetNegative ? "text-red-200" : "text-white"
        }`}>
          {hidden ? mask : heroValue}
        </p>

        {/* Income / Expense detail — tetap tampil di kedua tab */}
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/40 mb-2.5 text-center">{month}</p>
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">Pemasukan</p>
              <p className="text-base font-semibold tabular-nums text-white/90">
                {hidden ? mask : formatCurrency(income)}
              </p>
            </div>
            <div className="w-px bg-white/10" aria-hidden />
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">Pengeluaran</p>
              <p className="text-base font-semibold tabular-nums text-white/90">
                {hidden ? mask : formatCurrency(expense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense ratio bar */}
      {Number(income) > 0 && (
        <div
          className="rounded-2xl border border-border-subtle bg-card px-4 py-3.5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-medium text-secondary">Rasio pengeluaran</p>
            <p className="text-xs font-bold tabular-nums" style={{
              color: Number(expense) / Number(income) > 1
                ? "var(--color-danger)"
                : Number(expense) / Number(income) > 0.8
                ? "var(--color-warning)"
                : "var(--color-success)"
            }}>
              {Math.round((Number(expense) / Number(income)) * 100)}%
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-border-subtle overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(Math.round((Number(expense) / Number(income)) * 100), 100)}%`,
                backgroundColor: Number(expense) / Number(income) > 1
                  ? "var(--color-danger)"
                  : Number(expense) / Number(income) > 0.8
                  ? "var(--color-warning)"
                  : "var(--color-success)",
                boxShadow: `0 0 8px 0 ${Number(expense) / Number(income) > 1 ? "rgba(185,28,28,0.4)" : Number(expense) / Number(income) > 0.8 ? "rgba(180,83,9,0.4)" : "rgba(21,128,61,0.4)"}`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
