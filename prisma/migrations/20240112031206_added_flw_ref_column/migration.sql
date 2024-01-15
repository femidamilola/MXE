/*
  Warnings:

  - Added the required column `flwRef` to the `VirtualAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VirtualAccount" ADD COLUMN     "flwRef" TEXT NOT NULL;
