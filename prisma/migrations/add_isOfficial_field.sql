-- Add isOfficial field to documents table
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "isOfficial" BOOLEAN NOT NULL DEFAULT false;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'documents' AND column_name = 'isOfficial';
