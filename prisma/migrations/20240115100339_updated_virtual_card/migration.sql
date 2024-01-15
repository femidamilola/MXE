/*
  Warnings:

  - Added the required column `cardId` to the `VirtualCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardPan` to the `VirtualCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardType` to the `VirtualCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cvv` to the `VirtualCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiration` to the `VirtualCard` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `VirtualCard` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `VirtualCard` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VirtualCard" ADD COLUMN     "cardId" TEXT NOT NULL,
ADD COLUMN     "cardPan" TEXT NOT NULL,
ADD COLUMN     "cardType" TEXT NOT NULL,
ADD COLUMN     "cvv" TEXT NOT NULL,
ADD COLUMN     "expiration" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "transactionRef" TEXT,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;
