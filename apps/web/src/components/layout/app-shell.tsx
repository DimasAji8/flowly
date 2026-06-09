"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";
import { TransactionModal } from "@/components/transaction/transaction-modal";
import { ROUTES } from "@/constants/routes";

// Halaman root — tidak perlu back button
const ROOT_PATHS = new Set<string>([
  ROUTES.dashboard, ROUTES.transactions, ROUTES.calendar, ROUTES.profile,
]);

function DesktopHeader() {
  const pathname = usePathname();
  const router = useRouter();

  if (ROOT_PATHS.has(pathname)) return null;

  return (
    <div className="sticky top-0 z-20 hidden lg:flex items-center gap-3 rounded-t-2xl border-b border-border-subtle bg-(--color-bg)/90 backdrop-blur-md px-6 py-3">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Kembali"
        className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Kembali
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const auth = useRequireAuth();
  const [addOpen, setAddOpen] = useState(false);

  if (auth.status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full bg-background">
      <SideNav />

      {/* Desktop: konten di-center seperti Threads */}
      <div className="flex min-h-dvh w-full flex-col lg:flex-1 lg:items-center">
        <div className="flex w-full flex-1 flex-col lg:max-w-2xl lg:rounded-t-2xl lg:border-x lg:border-t lg:border-border-subtle lg:mt-4">
          <DesktopHeader />
          <main className="flex-1 px-5 pb-24 pt-6 lg:px-8 lg:pb-12 lg:pt-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>

      {/* Desktop FAB — kanan bawah seperti Threads */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        aria-label="Tambah transaksi"
        className="fixed bottom-8 right-24 hidden lg:flex size-20 items-center justify-center rounded-xl bg-card text-secondary border border-border-subtle transition-transform hover:scale-105 hover:text-accent active:scale-95 z-40"
        style={{ boxShadow: "var(--shadow-card-emphasis)" }}
      >
        <Plus className="size-8" strokeWidth={2} aria-hidden />
      </button>

      <TransactionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => window.dispatchEvent(new CustomEvent("flowly:transaction-added"))}
      />
    </div>
  );
}
