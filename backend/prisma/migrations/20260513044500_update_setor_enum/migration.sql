-- AlterEnum: Remove old values and add GESTAO
-- First, update any remaining users to valid values
UPDATE "User" SET setor = 'ADMIN' WHERE setor = 'TI';

-- Create the new enum type
CREATE TYPE "Setor_new" AS ENUM ('ADMIN', 'GESTAO');

-- Alter the column to use the new enum
ALTER TABLE "User" ALTER COLUMN setor TYPE "Setor_new" USING (setor::text::"Setor_new");

-- Drop the old enum type
DROP TYPE "Setor";

-- Rename the new enum type
ALTER TYPE "Setor_new" RENAME TO "Setor";
