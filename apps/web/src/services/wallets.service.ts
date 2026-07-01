import { apiClient } from "@/lib/api-client";
import type { Wallet, WalletType } from "@/types/finance";

export const walletsService = {
  list() {
    return apiClient.get<Wallet[]>("/wallets", {
      auth: true,
      workspaceScoped: true,
    });
  },

  create(payload: { name: string; type?: WalletType; balance?: number }) {
    return apiClient.post<Wallet>("/wallets", payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  update(id: string, payload: { name?: string; type?: WalletType }) {
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

  adjust(id: string, balance: number) {
    return apiClient.post<Wallet>(`/wallets/${id}/adjust`, { balance }, {
      auth: true,
      workspaceScoped: true,
    });
  },
};
