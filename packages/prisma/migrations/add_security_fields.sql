-- Aggiungi campi di sicurezza alla tabella User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginIp" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "backupCodesUsed" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Aggiungi campi di audit all'ActivityLog
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "action" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "resource" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "details" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "success" BOOLEAN;

-- Crea indici per performance
CREATE INDEX IF NOT EXISTS "ActivityLog_action_idx" ON "ActivityLog"("action");
CREATE INDEX IF NOT EXISTS "ActivityLog_success_idx" ON "ActivityLog"("success");

-- Rimuovi vincolo unique da TwoFactorCode.userId se esiste
-- Nota: questo potrebbe richiedere di ricreare la tabella in alcuni database
-- ALTER TABLE "TwoFactorCode" DROP CONSTRAINT IF EXISTS "TwoFactorCode_userId_key";
