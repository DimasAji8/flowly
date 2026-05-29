-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "needs_target" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "savings_target" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "wants_target" INTEGER NOT NULL DEFAULT 30;
