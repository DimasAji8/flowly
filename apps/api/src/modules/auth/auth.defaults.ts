import { CategoryGroup, TransactionType, WalletType } from '@prisma/client';

export const DEFAULT_WALLETS: {
  name: string;
  balance: number;
  type: WalletType;
}[] = [{ name: 'Tunai', balance: 0, type: WalletType.cash }];

export const DEFAULT_CATEGORIES: {
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  group?: CategoryGroup;
}[] = [
  // Expense — Needs
  {
    name: 'Makanan',
    type: TransactionType.expense,
    color: '#B91C1C',
    icon: '🍛',
    group: CategoryGroup.needs,
  },
  {
    name: 'Transportasi',
    type: TransactionType.expense,
    color: '#C2410C',
    icon: '🛵',
    group: CategoryGroup.needs,
  },
  {
    name: 'Tagihan',
    type: TransactionType.expense,
    color: '#A16207',
    icon: '🧾',
    group: CategoryGroup.needs,
  },
  // Expense — Wants
  {
    name: 'Belanja',
    type: TransactionType.expense,
    color: '#7C3AED',
    icon: '🛍️',
    group: CategoryGroup.wants,
  },
  {
    name: 'Lainnya',
    type: TransactionType.expense,
    color: '#4B5563',
    icon: '📦',
    group: CategoryGroup.wants,
  },
  // Income — no group
  {
    name: 'Gaji',
    type: TransactionType.income,
    color: '#15803D',
    icon: '💼',
  },
  { name: 'Bonus', type: TransactionType.income, color: '#0F766E', icon: '🎁' },
  {
    name: 'Lainnya',
    type: TransactionType.income,
    color: '#4B5563',
    icon: '💰',
  },
];
