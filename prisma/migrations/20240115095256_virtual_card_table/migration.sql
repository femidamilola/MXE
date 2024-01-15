-- CreateTable
CREATE TABLE "VirtualCard" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VirtualCard_email_key" ON "VirtualCard"("email");

-- AddForeignKey
ALTER TABLE "VirtualCard" ADD CONSTRAINT "VirtualCard_email_fkey" FOREIGN KEY ("email") REFERENCES "Wallet"("email") ON DELETE CASCADE ON UPDATE CASCADE;
