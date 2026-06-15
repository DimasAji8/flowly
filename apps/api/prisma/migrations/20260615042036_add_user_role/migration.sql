-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'developer');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'user';
