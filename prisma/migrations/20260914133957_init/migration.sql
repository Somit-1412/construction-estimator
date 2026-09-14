-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('SUBMITTED', 'PAYMENT_RECEIVED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
