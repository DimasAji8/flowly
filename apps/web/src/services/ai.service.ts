import { apiClient } from "@/lib/api-client";

export interface ParsedTransaction {
  type: "income" | "expense";
  amount: number;
  categoryId: string | null;
  walletId: string | null;
  note: string;
  transactionDate: string;
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
};
