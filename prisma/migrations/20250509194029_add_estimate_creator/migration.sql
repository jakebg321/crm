/*
  Warnings:

  - Added the required column `createdById` to the `Estimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Estimate" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
