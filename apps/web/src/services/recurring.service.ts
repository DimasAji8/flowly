import { apiClient } from "@/lib/api-client";
import type {
  RecurringFrequency,
  RecurringTransaction,
  TransactionType,
} from "@/types/finance";

export interface CreateRecurringPayload {
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId: string;
  frequency: RecurringFrequency;
  nextRunAt: string;
  note?: string;
  isActive?: boolean;
}

export interface ListRecurringQuery {
  type?: TransactionType;
  isActive?: boolean;
}

export const recurringService = {
  list(query: ListRecurringQuery = {}) {
    const params = new URLSearchParams();
    if (query.type !== undefined) params.set("type", query.type);
    if (query.isActive !== undefined) params.set("isActive", String(query.isActive));
    const qs = params.toString();
    return apiClient.get<RecurringTransaction[]>(`/recurring${qs ? `?${qs}` : ""}`, {
      auth: true,
      workspaceScoped: true,
    });
  },

  getById(id: string) {
    return apiClient.get<RecurringTransaction>(`/recurring/${id}`, {
      auth: true,
      workspaceScoped: true,
    });
  },

  create(payload: CreateRecurringPayload) {
    return apiClient.post<RecurringTransaction>("/recurring", payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  update(id: string, payload: Partial<CreateRecurringPayload>) {
    return apiClient.patch<RecurringTransaction>(
      `/recurring/${id}`,
      payload,
      { auth: true, workspaceScoped: true },
    );
  },

  remove(id: string) {
    return apiClient.delete<void>(`/recurring/${id}`, {
      auth: true,
      workspaceScoped: true,
    });
  },
};
