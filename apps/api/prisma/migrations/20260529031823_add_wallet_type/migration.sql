-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('bank', 'e_wallet', 'cash', 'credit', 'other');

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "type" "WalletType" NOT NULL DEFAULT 'cash';
