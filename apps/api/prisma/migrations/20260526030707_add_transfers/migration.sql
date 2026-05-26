-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "from_wallet_id" TEXT NOT NULL,
    "to_wallet_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "note" TEXT,
    "transfer_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transfers_workspace_id_idx" ON "transfers"("workspace_id");

-- CreateIndex
CREATE INDEX "transfers_workspace_id_transfer_date_idx" ON "transfers"("workspace_id", "transfer_date");

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_wallet_id_fkey" FOREIGN KEY ("from_wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_wallet_id_fkey" FOREIGN KEY ("to_wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
