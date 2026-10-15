-- AlterTable
ALTER TABLE "CustomerSession" ADD COLUMN     "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "CustomerSession_lastActiveAt_idx" ON "CustomerSession"("lastActiveAt");
