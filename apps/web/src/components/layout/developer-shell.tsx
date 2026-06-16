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
  const clear = useAuthStore((s) => s.clear);

  const handleLogout = () => {
    clear();
    router.push(ROUTES.login);
  };

  return (
    <aside
      aria-label="Developer"
      className="hidden lg:flex lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-border-subtle lg:px-4 lg:py-6"
    >
      {/* Brand */}
      <div className="mb-2 px-2">
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent">
            <Shield className="size-4" strokeWidth={2} />
          </span>
          Dev Console
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
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
                    "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-secondary hover:bg-card-subtle hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-4.5" strokeWidth={2} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-border-subtle pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="size-4.5" strokeWidth={2} aria-hidden />
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
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-background/90 backdrop-blur-md px-5 py-3 lg:hidden">
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Logout"
        className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 transition-colors"
      >
        <LogOut className="size-4" aria-hidden />
        Logout
      </button>
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <Shield className="size-3.5" strokeWidth={2} />
        Dev
      </span>
    </div>
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

      <div className="flex min-h-dvh w-full flex-col items-center lg:flex-1">
        <div className="flex w-full flex-1 flex-col lg:rounded-t-2xl lg:border-x lg:border-t lg:border-border-subtle lg:mt-4">
          <DeveloperMobileHeader />
          <main className="flex-1 px-5 pb-12 pt-6 lg:px-8 lg:pb-12 lg:pt-8">
            {children}
          </main>
        </div>
        {/* Mobile bottom spacer */}
        <div className="h-safe-area-bottom lg:hidden" />
      </div>
    </div>
  );
}
