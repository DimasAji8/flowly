"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  const router = useRouter();
  const { isReady, user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!isReady) return;
    if (user && accessToken) {
      router.replace(ROUTES.dashboard);
    } else {
      router.replace(ROUTES.login);
    }
  }, [isReady, user, accessToken, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-[var(--color-text-secondary)]">
      Loading…
    </div>
  );
}
