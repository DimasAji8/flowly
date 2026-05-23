"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";
import { ROUTES } from "@/constants/routes";

// Halaman root — tidak perlu back button
const ROOT_PATHS = new Set([
  ROUTES.dashboard, ROUTES.transactions, ROUTES.calendar,
  ROUTES.profile, ROUTES.wallets, ROUTES.categories, ROUTES.recurring,
]);

function DesktopHeader() {
  const pathname = usePathname();
  const router = useRouter();

  if (ROOT_PATHS.has(pathname as any)) return null;

  return (
    <div className="sticky top-0 z-20 hidden md:flex items-center gap-3 rounded-t-2xl border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/90 backdrop-blur-md px-6 py-3">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Back"
        className="grid size-8 place-items-center rounded-full hover:bg-[var(--color-card-subtle)] text-[var(--color-text-secondary)] transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const auth = useRequireAuth();

  if (auth.status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full bg-[var(--color-bg)]">
      <SideNav />

      {/* Desktop: konten di-center seperti Threads */}
      <div className="flex min-h-dvh w-full flex-col md:flex-1 md:items-center">
        <div className="flex w-full flex-1 flex-col md:max-w-2xl md:rounded-t-2xl md:border-x md:border-t md:border-[var(--color-border-subtle)]">
          <DesktopHeader />
          <main className="flex-1 px-5 pb-24 pt-6 md:px-8 md:pb-12 md:pt-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
