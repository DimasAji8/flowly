import { Wallet, WalletType } from '@prisma/client';

export interface SerializedWallet {
  id: string;
  name: string;
  type: WalletType;
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
    type: wallet.type,
    balance: wallet.balance.toString(),
    createdAt: wallet.createdAt,
  };
}
