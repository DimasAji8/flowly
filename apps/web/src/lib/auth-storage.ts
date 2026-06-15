/**
 * Token storage helper.
 *
 * Phase 1: simpan di localStorage untuk simplicity.
 * Catatan keamanan: nanti di Phase 5, bisa dimigrasi ke httpOnly cookie
 * (lebih aman terhadap XSS) dengan menambah session endpoint di backend.
 */

const STORAGE_KEY = "flowly.auth";

export interface StoredAuth {
  user: { id: string; name: string; email: string; role?: string };
  workspaceId: string;
  accessToken: string;
  refreshToken: string;
}

const isBrowser = () => typeof window !== "undefined";

export const authStorage = {
  read(): StoredAuth | null {
    if (!isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as StoredAuth;
    } catch {
      return null;
    }
  },

  write(value: StoredAuth): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  },

  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Update hanya accessToken (saat refresh berhasil).
   */
  updateAccessToken(accessToken: string): void {
    const current = this.read();
    if (!current) return;
    this.write({ ...current, accessToken });
  },
};
