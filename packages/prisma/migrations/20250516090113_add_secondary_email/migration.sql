-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "secondaryEmail" TEXT,
ADD COLUMN     "secondaryEmailVerified" TIMESTAMP(3);
