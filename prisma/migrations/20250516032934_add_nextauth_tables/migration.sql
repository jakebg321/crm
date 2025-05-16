/*
  Warnings:

  - You are about to drop the column `completed` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `brandingSettings` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `companySettings` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `estimateSettings` on the `UserSettings` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "companyId" TEXT NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Estimate" ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "taxRate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "terms" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "validUntil" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "flagColor" TEXT,
ADD COLUMN     "notesVisibleToClient" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerTaskFlag" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "completed",
DROP COLUMN "completedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "brandingSettings",
DROP COLUMN "companySettings",
DROP COLUMN "estimateSettings",
ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "companyLogo" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "defaultEstimateTerms" TEXT,
ADD COLUMN     "emailAddress" TEXT,
ADD COLUMN     "emailSignature" TEXT,
ADD COLUMN     "fontPrimary" TEXT,
ADD COLUMN     "fontSecondary" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "secondaryColor" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "taxRate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "transports" TEXT,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
