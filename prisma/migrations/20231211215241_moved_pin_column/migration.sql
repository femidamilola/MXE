/*
  Warnings:

  - You are about to drop the column `pin` on the `Account` table. All the data in the column will be lost.
  - Added the required column `pin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "pin";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pin" TEXT NOT NULL,
ALTER COLUMN "mobileNumber" DROP NOT NULL;
