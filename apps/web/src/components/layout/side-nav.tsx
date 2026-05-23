"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./bottom-nav";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

/**
 * Sidebar navigation untuk desktop (≥ md). Sticky di kiri.
 */
export function SideNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const avatarSrc = user?.gender === "m" ? "/svg/m.svg" : user?.gender === "f" ? "/svg/f.svg" : null;

  return (
    <aside
      aria-label="Primary"
      className="hidden md:flex md:sticky md:top-0 md:h-dvh md:w-72 md:shrink-0 md:flex-col md:border-r md:border-border-subtleolor-bg)] md:px-5 md:py-6"
    >
      <Link href={ROUTES.dashboard} className="mb-8 inline-flex items-center px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo-dark.webp" alt="Flowly" height={40} className="h-10 w-auto block dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo-light.webp" alt="Flowly" height={40} className="h-10 w-auto hidden dark:block" />
      </Link>

      <nav className="flex-1">
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
