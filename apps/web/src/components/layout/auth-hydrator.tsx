"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

/**
 * Pasang sekali di root supaya state auth ter-hidrasi dari localStorage
 * setelah render pertama (Next.js: localStorage tidak tersedia di SSR).
 */
export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
