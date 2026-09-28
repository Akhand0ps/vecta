-- DropForeignKey
ALTER TABLE "StoredFile" DROP CONSTRAINT "StoredFile_uploadedById_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT;

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
