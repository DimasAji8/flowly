import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than 0"),
  categoryId: z.string().min(1, "Pick a category"),
  walletId: z.string().min(1, "Pick a wallet"),
  note: z.string().max(280, "Note is too long").optional(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});

export type CreateTransactionFormValues = z.infer<
  typeof createTransactionSchema
>;
