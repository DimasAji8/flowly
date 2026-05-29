"use client";

import { create } from "zustand";
import { categoriesService } from "@/services/categories.service";
import type { Category } from "@/types/finance";

const TTL = 60_000; // 60 seconds

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  /** Fetch all categories — skips API call if cache is still fresh */
  fetch(): Promise<void>;
  /** Force next fetch() to hit the API */
  invalidate(): void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  lastFetched: null,

  async fetch() {
    const { lastFetched, loading } = get();
    if (loading) return;
    if (lastFetched !== null && Date.now() - lastFetched < TTL) return;
    set({ loading: true, error: null });
    try {
      const categories = await categoriesService.list();
      set({ categories, lastFetched: Date.now() });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Gagal memuat kategori" });
    } finally {
      set({ loading: false });
    }
  },

  invalidate() {
    set({ lastFetched: null });
  },
}));
