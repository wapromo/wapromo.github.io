-- CreateTable
CREATE TABLE "RegistrationAudit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistrationAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RegistrationAudit_createdAt_idx" ON "RegistrationAudit"("createdAt");

-- CreateIndex
CREATE INDEX "RegistrationAudit_ip_createdAt_idx" ON "RegistrationAudit"("ip", "createdAt");
