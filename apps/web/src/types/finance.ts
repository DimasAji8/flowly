export type TransactionType = "income" | "expense";
export type RecurringFrequency = "daily" | "weekly" | "monthly";
export type WalletType = "bank" | "e_wallet" | "cash" | "credit" | "savings" | "other";

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: string; // decimal as string
  createdAt: string;
}

export type CategoryGroup = "needs" | "wants" | "savings";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  group: CategoryGroup | null;
  createdAt: string;
}

export interface CategoryRef {
  id: string;
  name: string;
  color: string;
  icon: string;
  group: CategoryGroup | null;
}

export interface WalletRef {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  categoryId: string;
  walletId: string;
  userId: string;
  note: string | null;
  transactionDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  category: CategoryRef;
  wallet: WalletRef;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface TransactionList {
  data: Transaction[];
  meta: PaginationMeta;
}

export interface MonthlySummary {
  period: { year: number; month: number };
  income: string;
  expense: string;
  net: string;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: string;
  categoryId: string;
  walletId: string;
  frequency: RecurringFrequency;
  note: string | null;
  nextRunAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface DailySummary {
  period: { year: number; month: number };
  days: { date: string; income: string; expense: string }[];
}

export interface Transfer {
  id: string;
  workspaceId: string;
  fromWalletId: string;
  toWalletId: string;
  fromWalletName: string;
  toWalletName: string;
  amount: string;
  note: string | null;
  transferDate: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  linkedWalletId: string | null;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  note: string | null;
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
}
