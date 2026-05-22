"use client";

import { useRequireAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";

/**
 * Layout untuk semua page authed.
 *
 * Mobile (< md): bottom nav, content max-width 480px.
 * Desktop (≥ md): sidebar nav di kiri, content max-width 760px.
 */
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

      <div className="flex min-h-dvh w-full flex-col md:flex-1">
        <main className="flex-1 px-5 pb-24 pt-6 md:px-10 md:pb-12 md:pt-10">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
