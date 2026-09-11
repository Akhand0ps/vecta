/*
  Warnings:

  - A unique constraint covering the columns `[tokenHash]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Invitation_tokenHash_idx";

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
