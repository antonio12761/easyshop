-- Aggiungi campo per tracciare se l'utente ha già visto il messaggio di benvenuto
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasSeenWelcome" BOOLEAN NOT NULL DEFAULT false;

-- Aggiorna gli utenti esistenti che hanno già fatto login (hanno lastLoginAt)
UPDATE "User" SET "hasSeenWelcome" = true WHERE "lastLoginAt" IS NOT NULL;
