import { apiClient } from "@/lib/api-client";
import type { Category, TransactionType } from "@/types/finance";

export const categoriesService = {
  list(type?: TransactionType) {
    const qs = type ? `?type=${type}` : "";
    return apiClient.get<Category[]>(`/categories${qs}`, {
      auth: true,
      workspaceScoped: true,
    });
  },

  create(payload: { name: string; type: TransactionType; color?: string; icon?: string; group?: string }) {
    return apiClient.post<Category>("/categories", payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  update(id: string, payload: { name?: string; color?: string; icon?: string; group?: string }) {
    return apiClient.patch<Category>(`/categories/${id}`, payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  remove(id: string) {
    return apiClient.delete<void>(`/categories/${id}`, {
      auth: true,
      workspaceScoped: true,
    });
  },
};
