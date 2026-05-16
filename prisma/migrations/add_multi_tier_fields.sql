-- Add multi-tier knowledge system fields to documents table
-- Run this in Neon Console SQL Editor

-- Add contentTier field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "contentTier" TEXT NOT NULL DEFAULT 'curriculum';

-- Add topic field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "topic" TEXT;

-- Add concept field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "concept" TEXT;

-- Add difficulty field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "difficulty" TEXT;

-- Add sourceUrl field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;

-- Add sourceDomain field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "sourceDomain" TEXT;

-- Add trustScore field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.8;

-- Add examRelevance field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "examRelevance" TEXT;

-- Add realWorldApp field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "realWorldApp" BOOLEAN NOT NULL DEFAULT false;

-- Add interactive field
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "interactive" BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "documents_contentTier_idx" ON "documents"("contentTier");
CREATE INDEX IF NOT EXISTS "documents_topic_idx" ON "documents"("topic");
CREATE INDEX IF NOT EXISTS "documents_difficulty_idx" ON "documents"("difficulty");
CREATE INDEX IF NOT EXISTS "documents_trustScore_idx" ON "documents"("trustScore");

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name IN ('contentTier', 'topic', 'concept', 'difficulty', 'sourceUrl', 'sourceDomain', 'trustScore', 'examRelevance', 'realWorldApp', 'interactive')
ORDER BY column_name;
