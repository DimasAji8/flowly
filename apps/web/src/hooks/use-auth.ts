"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";

export function useRequireAuth() {
  const router = useRouter();
  const { isReady, user, accessToken } = useAuthStore();

  const isAuthed = Boolean(user && accessToken);

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace(ROUTES.login);
    }
  }, [isReady, isAuthed, router]);

  if (!isReady) return { status: "loading" as const };
  if (!isAuthed) return { status: "unauthenticated" as const };
  return { status: "authenticated" as const, user, accessToken };
}

export function useRedirectIfAuthed() {
  const router = useRouter();
  const { isReady, user, accessToken } = useAuthStore();

  const isAuthed = Boolean(user && accessToken);

  useEffect(() => {
    if (isReady && isAuthed) {
      const dest = user?.role === "developer" ? ROUTES.developer : ROUTES.dashboard;
      router.replace(dest);
    }
  }, [isReady, isAuthed, user, router]);

  return { isReady, isAuthed };
}
