-- CreateTable
CREATE TABLE "savings_goals" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "linked_wallet_id" TEXT,
    "name" TEXT NOT NULL,
    "target_amount" DECIMAL(18,2) NOT NULL,
    "current_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "target_date" DATE NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "savings_goals_workspace_id_idx" ON "savings_goals"("workspace_id");

-- CreateIndex
CREATE INDEX "savings_goals_workspace_id_target_date_idx" ON "savings_goals"("workspace_id", "target_date");

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_linked_wallet_id_fkey" FOREIGN KEY ("linked_wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;