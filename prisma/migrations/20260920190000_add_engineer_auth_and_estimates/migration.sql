ALTER TABLE "Project" ADD COLUMN "submissionTokenHash" TEXT;
CREATE UNIQUE INDEX "Project_submissionTokenHash_key" ON "Project"("submissionTokenHash");

CREATE TABLE "Engineer" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Engineer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Engineer_email_key" ON "Engineer"("email");

CREATE TABLE "EngineerSession" (
  "id" TEXT NOT NULL,
  "engineerId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EngineerSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EngineerSession_tokenHash_key" ON "EngineerSession"("tokenHash");
CREATE INDEX "EngineerSession_engineerId_idx" ON "EngineerSession"("engineerId");
CREATE INDEX "EngineerSession_expiresAt_idx" ON "EngineerSession"("expiresAt");
ALTER TABLE "EngineerSession" ADD CONSTRAINT "EngineerSession_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "Engineer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Estimate" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "snapshot" JSONB NOT NULL,
  "materialCost" DECIMAL(14,2) NOT NULL,
  "labourCost" DECIMAL(14,2) NOT NULL,
  "totalCost" DECIMAL(14,2) NOT NULL,
  "finalizedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Estimate_projectId_key" ON "Estimate"("projectId");
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ClientAccess" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClientAccess_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClientAccess_tokenHash_key" ON "ClientAccess"("tokenHash");
CREATE INDEX "ClientAccess_projectId_idx" ON "ClientAccess"("projectId");
ALTER TABLE "ClientAccess" ADD CONSTRAINT "ClientAccess_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
