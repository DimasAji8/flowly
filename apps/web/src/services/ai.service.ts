import { apiClient } from "@/lib/api-client";

export interface ParsedTransaction {
  type: "income" | "expense";
  amount: number;
  categoryId: string | null;
  walletId: string | null;
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

export const aiService = {
  parseTransaction(text: string) {
    return apiClient.post<ParsedTransaction>(
      "/ai/parse-transaction",
      { text },
      {
        auth: true,
        workspaceScoped: true,
      }
    );
  },

  scanReceipt(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post<ParsedTransaction>(
      "/ai/scan-receipt",
      formData,
      {
        auth: true,
        workspaceScoped: true,
      }
    );
  },

  getInsights() {
    return apiClient.get<FinancialInsight[]>(
      "/ai/insights",
      {
        auth: true,
        workspaceScoped: true,
      }
    );
  },
};

