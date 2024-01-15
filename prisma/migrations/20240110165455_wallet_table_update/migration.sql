/*
  Warnings:

  - You are about to drop the column `walletId` on the `VirtualAccount` table. All the data in the column will be lost.
  - You are about to drop the column `ref` on the `Wallet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `VirtualAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountNumber]` on the table `VirtualAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountNumber` to the `VirtualAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `VirtualAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VirtualAccount" DROP CONSTRAINT "VirtualAccount_walletId_fkey";

-- DropIndex
DROP INDEX "VirtualAccount_walletId_key";

-- DropIndex
DROP INDEX "Wallet_ref_key";

-- AlterTable
ALTER TABLE "VirtualAccount" DROP COLUMN "walletId",
ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "ref",
ADD COLUMN     "mxeTag" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccount_email_key" ON "VirtualAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccount_accountNumber_key" ON "VirtualAccount"("accountNumber");

-- AddForeignKey
ALTER TABLE "VirtualAccount" ADD CONSTRAINT "VirtualAccount_email_fkey" FOREIGN KEY ("email") REFERENCES "Wallet"("email") ON DELETE CASCADE ON UPDATE CASCADE;
