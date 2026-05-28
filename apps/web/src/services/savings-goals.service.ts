import { apiClient } from "@/lib/api-client";
import type { SavingsGoal } from "@/types/finance";

export interface CreateSavingsGoalPayload {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  linkedWalletId?: string;
  note?: string;
}

export const savingsGoalsService = {
  list() {
    return apiClient.get<SavingsGoal[]>("/savings-goals", {
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