/*
  Warnings:

  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'UN_VERIFIED');

-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "bvn" TEXT,
ADD COLUMN     "isAccountVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nationalIdCardUrl" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isIosUser" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Otp";

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountVerification" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UN_VERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateVerified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_beneficiaries" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_userId_key" ON "Token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountVerification_accountId_key" ON "AccountVerification"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "_beneficiaries_AB_unique" ON "_beneficiaries"("A", "B");

-- CreateIndex
CREATE INDEX "_beneficiaries_B_index" ON "_beneficiaries"("B");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountVerification" ADD CONSTRAINT "AccountVerification_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_beneficiaries" ADD CONSTRAINT "_beneficiaries_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_beneficiaries" ADD CONSTRAINT "_beneficiaries_B_fkey" FOREIGN KEY ("B") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
