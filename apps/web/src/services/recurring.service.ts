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

export const recurringService = {
  list() {
    return apiClient.get<RecurringTransaction[]>("/recurring", {
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
