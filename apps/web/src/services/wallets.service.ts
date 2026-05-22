import { apiClient } from "@/lib/api-client";
import type { Wallet } from "@/types/finance";

export const walletsService = {
  list() {
    return apiClient.get<Wallet[]>("/wallets", {
      auth: true,
      workspaceScoped: true,
    });
  },

  create(payload: { name: string; balance?: number }) {
    return apiClient.post<Wallet>("/wallets", payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  update(id: string, payload: { name?: string }) {
    return apiClient.patch<Wallet>(`/wallets/${id}`, payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  remove(id: string) {
    return apiClient.delete<void>(`/wallets/${id}`, {
      auth: true,
      workspaceScoped: true,
    });
  },
};
