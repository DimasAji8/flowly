"use client";

import { create } from "zustand";
import { workspaceService } from "@/services/workspace.service";
import type { AllocationTargets } from "@/services/workspace.service";

const TTL = 300_000; // 5 minutes

const DEFAULT_TARGETS: AllocationTargets = {
  needsTarget: 50,
  wantsTarget: 30,
  savingsTarget: 20,
};

interface WorkspaceStore {
  targets: AllocationTargets;
  loading: boolean;
  lastFetched: number | null;
  fetch(): Promise<void>;
  invalidate(): void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  targets: DEFAULT_TARGETS,
  loading: false,
  lastFetched: null,

  async fetch() {
    const { lastFetched, loading } = get();
    if (loading) return;
    if (lastFetched !== null && Date.now() - lastFetched < TTL) return;
    set({ loading: true });
    try {
      const ws = await workspaceService.getCurrent();
      set({
        targets: {
          needsTarget: ws.needsTarget,
          wantsTarget: ws.wantsTarget,
          savingsTarget: ws.savingsTarget,
        },
        lastFetched: Date.now(),
      });
    } catch {
      // silently fall back to defaults
    } finally {
      set({ loading: false });
    }
  },

  invalidate() {
    set({ lastFetched: null });
  },
}));
