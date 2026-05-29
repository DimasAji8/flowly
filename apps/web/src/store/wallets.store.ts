"use client";

import { create } from "zustand";
import { walletsService } from "@/services/wallets.service";
import type { Wallet } from "@/types/finance";

const TTL = 60_000; // 60 seconds

interface WalletStore {
  wallets: Wallet[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  /** Fetch wallets — skips API call if cache is still fresh */
  fetch(): Promise<void>;
  /** Force next fetch() to hit the API */
  invalidate(): void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: [],
  loading: false,
  error: null,
  lastFetched: null,

  async fetch() {
    const { lastFetched, loading } = get();
    if (loading) return;
    if (lastFetched !== null && Date.now() - lastFetched < TTL) return;
    set({ loading: true, error: null });
    try {
      const wallets = await walletsService.list();
      set({ wallets, lastFetched: Date.now() });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Gagal memuat dompet" });
    } finally {
      set({ loading: false });
    }
  },

  invalidate() {
    set({ lastFetched: null });
  },
}));
