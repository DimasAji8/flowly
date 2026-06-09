"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { LayoutDashboard, CalendarDays, ArrowLeftRight, Wallet, Target, Tag, Repeat, PieChart, CircleUserRound, BarChart2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

const SIDE_NAV_ITEMS = [
  { href: ROUTES.dashboard,          label: "Beranda",       icon: LayoutDashboard },
  { href: ROUTES.transactions,       label: "Transaksi",     icon: ArrowLeftRight, matchPrefix: "/transactions" },
  { href: ROUTES.calendar,           label: "Kalender",      icon: CalendarDays },
  { href: ROUTES.wallets,            label: "Dompet",        icon: Wallet, matchPrefix: "/wallets" },
  { href: ROUTES.savingsGoals,       label: "Tabungan",      icon: Target },
  { href: ROUTES.categories,         label: "Kategori",      icon: Tag },
  { href: ROUTES.recurring,          label: "Berulang",      icon: Repeat },
  { href: ROUTES.profileAllocation,  label: "Alokasi",       icon: PieChart },
  { href: ROUTES.reports,            label: "Laporan",      icon: BarChart2 },
  { href: ROUTES.profile,            label: "Profil",        icon: CircleUserRound },
];

/**
 * Sidebar navigation untuk desktop (≥ md). Sticky di kiri.
 */
export function SideNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { resolvedTheme } = useTheme();
  const avatarSrc = user?.gender === "m" ? "/svg/m.svg" : user?.gender === "f" ? "/svg/f.svg" : null;

  return (
    <aside
      aria-label="Primary"
      className="hidden lg:flex lg:sticky lg:top-0 lg:h-dvh lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-border-subtle lg:px-5 lg:py-6"
    >
      <Link href={ROUTES.dashboard} className="mb-8 inline-flex items-center px-2">
        <Image src={resolvedTheme === "dark" ? "/img/logo-text-white.webp" : "/img/logo-text-blue.webp"} alt="Teman Kas" width={200} height={50} className="h-12 w-auto" style={{ width: "auto" }} />
      </Link>

      <nav className="flex-1">
        <ul className="flex flex-col gap-1">
          {SIDE_NAV_ITEMS.map((item) => {
            const isActive = item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "flex h-11 items-center gap-3 rounded-xl px-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-secondary hover:bg-card-subtle hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-5" strokeWidth={2} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info di bawah sidebar */}
      <div className="flex items-center gap-3 rounded-xl px-3 py-3 border border-border-subtle bg-card">
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarSrc} alt={user?.name ?? "avatar"} width={36} height={36} className="size-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent select-none">
            {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-semibold text-foreground">{user?.name ?? "..."}</span>
          <span className="truncate text-xs text-muted">{user?.email ?? ""}</span>
        </div>
      </div>
    </aside>
  );
}
