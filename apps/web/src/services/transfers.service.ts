import { apiClient } from "@/lib/api-client";
import type { Transfer } from "@/types/finance";

export interface CreateTransferPayload {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  note?: string;
  transferDate: string;
}

export const transfersService = {
  list(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    const qs = params.toString();
    return apiClient.get<Transfer[]>(`/transfers${qs ? `?${qs}` : ''}`, { auth: true, workspaceScoped: true });
  },
  create(payload: CreateTransferPayload) {
    return apiClient.post<Transfer>("/transfers", payload, { auth: true, workspaceScoped: true });
  },
  remove(id: string) {
    return apiClient.delete<void>(`/transfers/${id}`, { auth: true, workspaceScoped: true });
  },
};
