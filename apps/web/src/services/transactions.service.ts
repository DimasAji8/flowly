import { apiClient } from "@/lib/api-client";
import type {
  DailySummary,
  MonthlySummary,
  Transaction,
  TransactionList,
  TransactionType,
} from "@/types/finance";

export interface ListTransactionsQuery {
  from?: string;
  to?: string;
  type?: TransactionType;
  walletId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId: string;
  note?: string;
  transactionDate: string;
}

function buildQuery(q: ListTransactionsQuery): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const transactionsService = {
  list(query: ListTransactionsQuery = {}) {
    return apiClient.get<TransactionList>(
      `/transactions${buildQuery(query)}`,
      { auth: true, workspaceScoped: true },
    );
  },

  getById(id: string) {
    return apiClient.get<Transaction>(`/transactions/${id}`, {
      auth: true,
      workspaceScoped: true,
    });
  },

  create(payload: CreateTransactionPayload) {
    return apiClient.post<Transaction>("/transactions", payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  update(id: string, payload: Partial<CreateTransactionPayload>) {
    return apiClient.patch<Transaction>(`/transactions/${id}`, payload, {
      auth: true,
      workspaceScoped: true,
    });
  },

  remove(id: string) {
    return apiClient.delete<void>(`/transactions/${id}`, {
      auth: true,
      workspaceScoped: true,
    });
  },

  monthlySummary(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year !== undefined) params.set("year", String(year));
    if (month !== undefined) params.set("month", String(month));
    const qs = params.toString();
    return apiClient.get<MonthlySummary>(
      `/transactions/summary/monthly${qs ? `?${qs}` : ""}`,
      { auth: true, workspaceScoped: true },
    );
  },

  dailySummary(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year !== undefined) params.set("year", String(year));
    if (month !== undefined) params.set("month", String(month));
    const qs = params.toString();
    return apiClient.get<DailySummary>(
      `/transactions/summary/daily${qs ? `?${qs}` : ""}`,
      { auth: true, workspaceScoped: true },
    );
  },
};
