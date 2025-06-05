-- Aggiungi campo per tracciare il login precedente
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "previousLoginAt" TIMESTAMP(3);

-- Per gli utenti esistenti, se hanno lastLoginAt, copialo in previousLoginAt
UPDATE "User" 
SET "previousLoginAt" = "lastLoginAt" 
WHERE "lastLoginAt" IS NOT NULL AND "previousLoginAt" IS NULL;
