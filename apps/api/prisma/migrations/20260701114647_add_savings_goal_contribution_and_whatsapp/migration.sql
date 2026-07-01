/*
  Warnings:

  - A unique constraint covering the columns `[whatsapp_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "whatsapp_number" TEXT;

-- CreateTable
CREATE TABLE "savings_goal_contributions" (
    "id" TEXT NOT NULL,
    "savings_goal_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_goal_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "savings_goal_contributions_savings_goal_id_idx" ON "savings_goal_contributions"("savings_goal_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_number_key" ON "users"("whatsapp_number");

-- AddForeignKey
ALTER TABLE "savings_goal_contributions" ADD CONSTRAINT "savings_goal_contributions_savings_goal_id_fkey" FOREIGN KEY ("savings_goal_id") REFERENCES "savings_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
