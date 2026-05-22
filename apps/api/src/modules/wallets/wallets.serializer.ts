import { Wallet } from '@prisma/client';

export interface SerializedWallet {
  id: string;
  name: string;
  balance: string;
  createdAt: Date;
}

/**
 * Serialize wallet ke bentuk yang aman dikirim sebagai JSON.
 * Decimal di-convert ke string supaya presisinya tidak hilang.
 */
export function serializeWallet(wallet: Wallet): SerializedWallet {
  return {
    id: wallet.id,
    name: wallet.name,
    balance: wallet.balance.toString(),
    createdAt: wallet.createdAt,
  };
}
