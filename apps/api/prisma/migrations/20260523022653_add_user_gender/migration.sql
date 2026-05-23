-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('m', 'f');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" "Gender";
