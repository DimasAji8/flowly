export const ROUTES = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/dashboard",
  transactions: "/transactions",
  transactionsNew: "/transactions/new",
  calendar: "/calendar",
  profile: "/profile",
  savingsGoals: "/savings-goals",
  wallets: "/wallets",
  walletTransfers: "/wallets/transfers",
  categories: "/categories",
  recurring: "/recurring",
  profileAllocation: "/profile/allocation",
  reports: "/reports",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
