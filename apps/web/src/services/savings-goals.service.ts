import { apiClient } from "@/lib/api-client";
import type { SavingsGoal } from "@/types/finance";

export interface CreateSavingsGoalPayload {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  linkedWalletId?: string;
  note?: string;
  isPaused?: boolean;
}

export interface ListSavingsGoalsQuery {
  isPaused?: boolean;
  isCompleted?: boolean;
}

export const savingsGoalsService = {
  list(query: ListSavingsGoalsQuery = {}) {
    const params = new URLSearchParams();
    if (query.isPaused !== undefined) params.set("isPaused", String(query.isPaused));
    if (query.isCompleted !== undefined) params.set("isCompleted", String(query.isCompleted));
    const qs = params.toString();
    return apiClient.get<SavingsGoal[]>(`/savings-goals${qs ? `?${qs}` : ""}`, {
      auth: true,
      workspaceScoped: true,
    });
  },

  create(payload: CreateSavingsGoalPayload) {
    return apiClient.post<SavingsGoal>("/savings-goals", payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  update(id: string, payload: Partial<CreateSavingsGoalPayload>) {
    return apiClient.patch<SavingsGoal>(`/savings-goals/${id}`, payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  remove(id: string) {
    return apiClient.delete<void>(`/savings-goals/${id}`, {
      auth: true,
      workspaceScoped: true,
    });
  },
};