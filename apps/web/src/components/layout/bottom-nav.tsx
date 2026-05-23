"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, CircleUserRound, Coins, LayoutDashboard, Plus, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { TransactionModal } from "@/components/transaction/transaction-modal";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchPrefix?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.dashboard, label: "Beranda", icon: LayoutDashboard },
  { href: ROUTES.calendar, label: "Kalender", icon: CalendarDays },
  // slot tengah kosong untuk FAB
  { href: ROUTES.transactions, label: "Transaksi", icon: Coins, matchPrefix: "/transactions" },
  { href: ROUTES.profile, label: "Profil", icon: CircleUserRound },
];

// Nav items split: 2 kiri, FAB tengah, 2 kanan
const LEFT_ITEMS = NAV_ITEMS.slice(0, 2);
const RIGHT_ITEMS = NAV_ITEMS.slice(2);

export function BottomNav() {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const allItems = [...LEFT_ITEMS, ...RIGHT_ITEMS];
  const activeIndex = allItems.findIndex((item) =>
    item.matchPrefix ? pathname.startsWith(item.matchPrefix) : pathname === item.href
  );

  useEffect(() => {
    const updateLineWidth = () => {
      const textEl = textRefs.current[activeIndex];
      const itemEl = itemRefs.current[activeIndex];
      if (textEl && itemEl) {
        itemEl.style.setProperty("--line-width", `${textEl.offsetWidth}px`);
      }
    };
    updateLineWidth();
    window.addEventListener("resize", updateLineWidth);
    return () => window.removeEventListener("resize", updateLineWidth);
  }, [activeIndex]);

  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = index === activeIndex;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        ref={(el) => { itemRefs.current[index] = el; }}
        aria-current={isActive ? "page" : undefined}
        className="group relative flex flex-1 flex-col items-center justify-center gap-0.5 h-16"
        style={{ "--line-width": "0px" } as React.CSSProperties}
      >
        {isActive && (
          <span
            className="absolute top-0 h-0.5 rounded-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: "var(--line-width)" }}
            aria-hidden
          />
        )}
        <span
          style={isActive ? { animation: "flowly-icon-bounce 0.5s ease" } : undefined}
          aria-hidden
        >
          <Icon
            className="size-5 transition-colors"
            strokeWidth={isActive ? 2.5 : 2}
            style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-muted)" }}
          />
        </span>
        <span
          ref={(el) => { textRefs.current[index] = el; }}
          className="text-[11px] font-medium transition-colors"
          style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-muted)" }}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      <nav
        aria-label="Primary"
        className="sticky bottom-0 z-30 w-full border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-md md:hidden"
      >
        <div className="flex items-center">
          {/* Left items */}
          {LEFT_ITEMS.map((item, i) => renderNavItem(item, i))}

          {/* FAB center */}
          <div className="flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              aria-label="Add transaction"
              className="relative -top-4 flex size-14 items-center justify-center rounded-full bg-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/30 transition-transform active:scale-95"
            >
              <Plus className="size-6 text-white" strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          {/* Right items */}
          {RIGHT_ITEMS.map((item, i) => renderNavItem(item, i + LEFT_ITEMS.length))}
        </div>
      </nav>

      <TransactionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          // trigger reload di halaman aktif via custom event
          window.dispatchEvent(new CustomEvent("flowly:transaction-added"));
        }}
      />
    </>
  );
}
