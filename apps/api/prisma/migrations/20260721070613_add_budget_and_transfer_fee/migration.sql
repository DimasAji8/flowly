-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "fee" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "period" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budgets_workspace_id_idx" ON "budgets"("workspace_id");

-- CreateIndex
CREATE INDEX "budgets_workspace_id_period_idx" ON "budgets"("workspace_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_workspace_id_category_id_period_key" ON "budgets"("workspace_id", "category_id", "period");

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
