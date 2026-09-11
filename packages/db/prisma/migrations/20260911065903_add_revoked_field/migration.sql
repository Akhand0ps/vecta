-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revokedAt" TIMESTAMP(3);
