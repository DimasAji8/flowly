"use client";

import { create } from "zustand";
import { authStorage } from "@/lib/auth-storage";
import { authService } from "@/services/auth.service";
import type { AuthSession, AuthUser } from "@/types/auth";

interface AuthState {
  /** Sudah selesai hidrasi dari localStorage? */
  isReady: boolean;
  user: AuthUser | null;
  workspaceId: string | null;
  accessToken: string | null;

  hydrate(): void;
  setSession(session: AuthSession): void;
  clear(): void;
  refreshMe(): Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isReady: false,
  user: null,
  workspaceId: null,
  accessToken: null,

  hydrate() {
    if (get().isReady) return;
    const stored = authStorage.read();
    set({
      isReady: true,
      user: stored?.user ?? null,
      workspaceId: stored?.workspaceId ?? null,
      accessToken: stored?.accessToken ?? null,
    });
  },

  setSession(session) {
    authStorage.write(session);
    set({
      isReady: true,
      user: session.user,
      workspaceId: session.workspaceId,
      accessToken: session.accessToken,
    });
  },

  clear() {
    authStorage.clear();
    set({
      isReady: true,
      user: null,
      workspaceId: null,
      accessToken: null,
    });
  },

  async refreshMe() {
    try {
      const { user } = await authService.me();
      const stored = authStorage.read();
      if (stored) authStorage.write({ ...stored, user });
      set({ user });
    } catch {
      get().clear();
    }
  },
}));

export const isAuthenticated = (state: AuthState) =>
  Boolean(state.user && state.accessToken);
