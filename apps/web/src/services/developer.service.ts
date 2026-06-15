import { apiClient } from "@/lib/api-client";

export interface DeveloperStats {
  users: number;
  workspaces: number;
  wallets: number;
  totalIncome: number;
  totalExpense: number;
  transactions: number;
  savingsGoals: number;
  transfers: number;
  recurringTransactions: number;
}

export interface DeveloperUser {
  id: string;
  name: string;
  email: string;
  gender: string | null;
  role: string;
  createdAt: string;
  ownedWorkspaces: number;
  memberOf: number;
  transactions: number;
}

export interface DeveloperWorkspaceStats {
  total: number;
  totalMembers: number;
  avgMembersPerWorkspace: number;
  list: Array<{
    id: string;
    name: string;
    createdAt: string;
    members: number;
    wallets: number;
    categories: number;
    transactions: number;
    savingsGoals: number;
  }>;
}

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

  listUsers() {
    return apiClient.get<DeveloperUser[]>("/developer/users", { auth: true });
  },

  getWorkspaceStats() {
    return apiClient.get<DeveloperWorkspaceStats>("/developer/workspaces", { auth: true });
  },

  getHealth() {
    return apiClient.get<DeveloperHealth>("/developer/health", { auth: true });
  },
};
