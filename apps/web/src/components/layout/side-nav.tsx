"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { NAV_ITEMS } from "./bottom-nav";
import { ROUTES } from "@/constants/routes";

/**
 * Sidebar navigation untuk desktop (≥ md). Sticky di kiri.
 */
export function SideNav() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Primary"
      className="hidden md:flex md:sticky md:top-0 md:h-dvh md:w-72 md:shrink-0 md:flex-col md:border-r md:border-[var(--color-border-subtle)] md:bg-[var(--color-bg)] md:px-5 md:py-6"
    >
      <Link
        href={ROUTES.dashboard}
        className="mb-6 inline-flex items-center gap-2 px-2 text-lg font-semibold tracking-tight text-[var(--color-text-primary)]"
      >
        <span className="grid size-8 place-items-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Wallet className="size-4" strokeWidth={2.2} aria-hidden />
        </span>
        Flowly
      </Link>

      <nav>
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
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
                    "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-card-subtle)] hover:text-[var(--color-text-primary)]",
                  ].join(" ")}
                >
                  <Icon className="size-4" strokeWidth={2} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
