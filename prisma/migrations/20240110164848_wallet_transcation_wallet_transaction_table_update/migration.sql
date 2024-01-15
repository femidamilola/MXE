/*
  Warnings:

  - You are about to drop the column `accountId` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `virualAccountNumber` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `transactionTime` on the `WalletTransaction` table. All the data in the column will be lost.
  - You are about to drop the `Transactions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ref]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ref` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondaryEmail` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionRef` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'STRIPE', 'PAYPAL', 'WALLET');

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_accountId_fkey";

-- DropIndex
DROP INDEX "Wallet_accountId_key";

-- DropIndex
DROP INDEX "Wallet_virualAccountNumber_key";

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "accountId",
DROP COLUMN "virualAccountNumber",
ADD COLUMN     "ref" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WalletTransaction" DROP COLUMN "transactionTime",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ownerMxeTag" TEXT,
ADD COLUMN     "secondaryEmail" TEXT NOT NULL,
ADD COLUMN     "secondaryMxeTag" TEXT,
ADD COLUMN     "transactionRef" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Transactions";

-- CreateTable
CREATE TABLE "VirtualAccount" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VirtualAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "transactionRef" TEXT NOT NULL,
    "mobileNumber" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "flwRef" TEXT,
    "name" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "transactionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentGateway" "PaymentGateway" NOT NULL DEFAULT 'FLUTTERWAVE',
    "senderEmail" TEXT NOT NULL,
    "receiverEmail" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'TRANSFER',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccount_walletId_key" ON "VirtualAccount"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_ref_key" ON "Wallet"("ref");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_email_fkey" FOREIGN KEY ("email") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualAccount" ADD CONSTRAINT "VirtualAccount_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_secondaryEmail_fkey" FOREIGN KEY ("secondaryEmail") REFERENCES "Account"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderEmail_fkey" FOREIGN KEY ("senderEmail") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiverEmail_fkey" FOREIGN KEY ("receiverEmail") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;
