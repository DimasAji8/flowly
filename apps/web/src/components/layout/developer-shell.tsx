"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Users, Database, Activity, MessageSquare, LogOut } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";

const DEV_NAV_ITEMS = [
  { href: ROUTES.developer, label: "Dashboard", icon: Shield },
  { href: `${ROUTES.developer}/users`, label: "Users", icon: Users },
  { href: `${ROUTES.developer}/workspaces`, label: "Workspaces", icon: Database },
  { href: `${ROUTES.developer}/reviews`, label: "Reviews", icon: MessageSquare },
  { href: `${ROUTES.developer}/health`, label: "Health", icon: Activity },
];

function DeveloperSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const handleLogout = () => {
    clear();
    router.push(ROUTES.login);
  };

  return (
    <aside
      aria-label="Developer"
      className="hidden lg:flex lg:sticky lg:top-0 lg:h-dvh lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-border-subtle lg:px-5 lg:py-6"
    >
      {/* Brand */}
      <div className="mb-8 px-2 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
          <Shield className="size-5" strokeWidth={2} />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground leading-none">Teman Kas</span>
          <span className="text-[10px] font-semibold tracking-wider text-muted uppercase mt-0.5">Dev Console</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="flex flex-col gap-1">
          {DEV_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === ROUTES.developer
                ? pathname === ROUTES.developer
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-all duration-150 active:scale-[0.98]",
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-secondary hover:bg-card-subtle hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Developer Profile & Logout */}
      <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 mt-auto">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-border-subtle bg-card">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-accent select-none">
            {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-bold text-foreground">{user?.name ?? "Developer"}</span>
            <span className="truncate text-[10px] font-semibold text-accent uppercase tracking-wide">Developer Mode</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-red-500 hover:bg-red-500/10 active:scale-[0.98] transition-all"
        >
          <LogOut className="size-5" strokeWidth={2} aria-hidden />
          Logout
        </button>
      </div>
    </aside>
  );
}

function DeveloperMobileHeader() {
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  const handleLogout = () => {
    clear();
    router.push(ROUTES.login);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-background/90 backdrop-blur-md px-5 py-3 lg:hidden">
      <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
        <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent">
          <Shield className="size-4" strokeWidth={2} />
        </span>
        Dev Console
      </span>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Logout"
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 active:scale-95 transition-all"
      >
        <LogOut className="size-3.5" aria-hidden />
        Keluar
      </button>
    </header>
  );
}

function DeveloperBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Developer Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border-subtle bg-background/90 backdrop-blur-md lg:hidden"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {DEV_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === ROUTES.developer
              ? pathname === ROUTES.developer
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex flex-col items-center justify-center gap-1 flex-1 h-full text-center relative",
                isActive ? "text-accent" : "text-muted hover:text-foreground",
              ].join(" ")}
            >
              {isActive && (
                <span
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-accent transition-all duration-300"
                  aria-hidden
                />
              )}
              <Icon className="size-5 transition-colors" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold transition-colors">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DeveloperShell({ children }: { children: React.ReactNode }) {
  const auth = useRequireAuth();

  if (auth.status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full bg-background">
      <DeveloperSideNav />

      <div className="flex min-h-dvh w-full flex-col lg:flex-1">
        <div className="flex w-full flex-1 flex-col">
          <DeveloperMobileHeader />
          <main className="flex-1 w-full mx-auto max-w-7xl px-5 pb-24 pt-6 lg:px-10 lg:pb-16 lg:pt-10">
            {children}
          </main>
        </div>
        <DeveloperBottomNav />
        {/* Mobile bottom spacer for safe area */}
        <div className="h-safe-area-bottom lg:hidden" />
      </div>
    </div>
  );
}

