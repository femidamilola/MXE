/*
  Warnings:

  - Added the required column `transactionRef` to the `VirtualAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VirtualAccount" ADD COLUMN     "transactionRef" TEXT NOT NULL;
