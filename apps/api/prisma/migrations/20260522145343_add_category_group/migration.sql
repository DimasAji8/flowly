-- CreateEnum
CREATE TYPE "CategoryGroup" AS ENUM ('needs', 'wants', 'savings');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "group" "CategoryGroup";
