import { apiClient } from "@/lib/api-client";

// Adoption rates are decimal 0..1 — frontend formats as %.
export interface DeveloperEngagement {
  walletAdoption: number;
  transactionAdoption: number;
  transferAdoption: number;
  avgTxPerActiveUser: number;
}

export interface DeveloperFeatureAdoption {
  savingsGoalAdoption: number;
  recurringAdoption: number;
}

export interface TransactionTrendPoint {
  date: string; // YYYY-MM-DD
  label: string; // "16 Jun"
  count: number;
}

export interface DeveloperStats {
  // Raw counts
  users: number;
  transactions: number;
  workspaces: number;
  wallets: number;
  savingsGoals: number;
  transfers: number;
  recurringTransactions: number;

  // Volume
  totalIncome: number;
  totalExpense: number;
  volumeNet: number;

  // Active users (DAU/WAU/MAU)
  activeUsers24h: number;
  activeUsers7d: number;
  activeUsers30d: number;

  // Tren transaksi 7 hari
  transactionsThisWeek: number;
  transactionsByDay: TransactionTrendPoint[];

  // Adoption (desimal 0..1)
  engagement: DeveloperEngagement;
  featureAdoption: DeveloperFeatureAdoption;
}

export interface DeveloperUser {
  id: string;
  name: string;
  email: string;
  gender: string | null;
  role: string;
  isSuspended: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  ownedWorkspaces: number;
  memberOf: number;
  transactions: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type DeveloperWorkspaceStats = {
  total: number;
  totalMembers: number;
  avgMembersPerWorkspace: number;
  totalSavingsGoals: number;
} & PaginatedResponse<{
  id: string;
  name: string;
  createdAt: string;
  members: number;
  wallets: number;
  categories: number;
  transactions: number;
  savingsGoals: number;
}>;

export interface DeveloperHealth {
  status: string;
  timestamp: string;
  database: { status: string; latencyMs: number | null };
  uptime: number;
  memory: { rss: number; heapTotal: number; heapUsed: number };
  nodeVersion: string;
  platform: string;
}

export const developerService = {
  getStats() {
    return apiClient.get<DeveloperStats>("/developer/stats", { auth: true });
  },

  listUsers(page = 1, pageSize = 10) {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return apiClient.get<PaginatedResponse<DeveloperUser>>(
      `/developer/users?${qs}`,
      { auth: true },
    );
  },

  getWorkspaceStats(page = 1, pageSize = 10) {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return apiClient.get<DeveloperWorkspaceStats>(
      `/developer/workspaces?${qs}`,
      { auth: true },
    );
  },

  getHealth() {
    return apiClient.get<DeveloperHealth>("/developer/health", { auth: true });
  },

  updateUserRole(id: string, role: string) {
    return apiClient.patch<any>(`/developer/users/${id}/role`, { role }, { auth: true });
  },

  toggleUserSuspension(id: string) {
    return apiClient.patch<any>(`/developer/users/${id}/suspend`, {}, { auth: true });
  },

  deleteUser(id: string) {
    return apiClient.delete<any>(`/developer/users/${id}`, { auth: true });
  },
};
