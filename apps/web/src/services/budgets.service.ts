import { apiClient } from "@/lib/api-client";
import type { CategoryGroup } from "@/types/finance";

export interface BudgetSummaryItem {
  id: string | null;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  categoryGroup: CategoryGroup | null;
  limit: number | null;
  spent: number;
  remaining: number | null;
  percentage: number;
  period: string;
}

export const budgetsService = {
  getSummary(period: string) {
    return apiClient.get<BudgetSummaryItem[]>(`/budgets/summary?period=${period}`, {
      auth: true,
      workspaceScoped: true,
    });
  },

  upsert(payload: { categoryId: string; amount: number; period: string }) {
    return apiClient.post<any>("/budgets", payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  remove(id: string) {
    return apiClient.delete<{ success: boolean }>(`/budgets/${id}`, {
      auth: true,
      workspaceScoped: true,
    });
  },
};
