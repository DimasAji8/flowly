export const ROUTES = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/dashboard",
  transactions: "/transactions",
  transactionsNew: "/transactions/new",
  calendar: "/calendar",
  profile: "/profile",
  wallets: "/wallets",
  categories: "/categories",
  recurring: "/recurring",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
