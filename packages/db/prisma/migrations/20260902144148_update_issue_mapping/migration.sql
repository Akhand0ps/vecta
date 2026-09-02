-- CreateEnum
CREATE TYPE "AssignStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "IssueMapping" ADD COLUMN     "status" "AssignStatus" NOT NULL DEFAULT 'ACTIVE';
