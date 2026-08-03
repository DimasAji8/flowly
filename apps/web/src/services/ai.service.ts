import { apiClient } from "@/lib/api-client";

export interface ParsedTransaction {
  intent?: "transaction" | "transfer";
  type?: "income" | "expense";
  amount: number;
  categoryId?: string | null;
  walletId?: string | null;
  fromWalletId?: string | null;
  fromWalletName?: string | null;
  toWalletId?: string | null;
  toWalletName?: string | null;
  notFoundWallets?: string[];
  note: string;
  transactionDate: string;
}

export interface FinancialInsight {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  actionLabel: string | null;
  actionUrl: string | null;
}

export interface ScannedMutationItem {
  date: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  note: string;
  categoryId: string | null;
  walletId: string | null;
  isDuplicate: boolean;
}

export const aiService = {
  parseTransaction(text: string) {
    return apiClient.post<ParsedTransaction>(
      "/ai/parse-transaction",
      { text },
      { auth: true, workspaceScoped: true }
    );
  },

  scanReceipt(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ParsedTransaction>("/ai/scan-receipt", formData, {
      auth: true,
      workspaceScoped: true,
    });
  },

  scanMutation(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ScannedMutationItem[]>("/ai/scan-mutation", formData, {
      auth: true,
      workspaceScoped: true,
    });
  },

  getInsights(force = false) {
    const qs = force ? "?force=true" : "";
    return apiClient.get<FinancialInsight[]>(`/ai/insights${qs}`, {
      auth: true,
      workspaceScoped: true,
    });
  },
};
