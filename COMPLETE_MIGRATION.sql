-- ============================================
-- COMPLETE DATABASE MIGRATION
-- This adds ALL missing columns from the Prisma schema
-- Run this ENTIRE script in Neon Console SQL Editor
-- ============================================

-- First, let's see what columns currently exist
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- Now add ALL missing columns from the schema
-- These use IF NOT EXISTS so it's safe to run multiple times

ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "documentType" TEXT NOT NULL DEFAULT 'textbook',
ADD COLUMN IF NOT EXISTS "educationSystem" TEXT NOT NULL DEFAULT 'punjab_board',
ADD COLUMN IF NOT EXISTS "level" TEXT NOT NULL DEFAULT 'matric',
ADD COLUMN IF NOT EXISTS "class" TEXT,
ADD COLUMN IF NOT EXISTS "subject" TEXT,
ADD COLUMN IF NOT EXISTS "year" INTEGER,
ADD COLUMN IF NOT EXISTS "board" TEXT,
ADD COLUMN IF NOT EXISTS "examType" TEXT,
ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'english',
ADD COLUMN IF NOT EXISTS "uploadMode" TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS "chapterNumber" INTEGER,
ADD COLUMN IF NOT EXISTS "chapterName" TEXT,
ADD COLUMN IF NOT EXISTS "extractionMethod" TEXT,
ADD COLUMN IF NOT EXISTS "extractionQuality" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;

-- Verify all columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- Create ContentBlock table if it doesn't exist
CREATE TABLE IF NOT EXISTS "content_blocks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "chapterNumber" INTEGER,
    "pageNumber" INTEGER NOT NULL,
    "position" JSONB,
    "content" JSONB NOT NULL,
    "textContent" TEXT NOT NULL,
    "equations" TEXT[],
    "concepts" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for content_blocks if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'content_blocks_documentId_fkey'
    ) THEN
        ALTER TABLE "content_blocks" 
        ADD CONSTRAINT "content_blocks_documentId_fkey" 
        FOREIGN KEY ("documentId") 
        REFERENCES "documents"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "documents_userId_educationSystem_level_subject_idx" 
ON "documents"("userId", "educationSystem", "level", "subject");

CREATE INDEX IF NOT EXISTS "documents_board_class_subject_year_idx" 
ON "documents"("board", "class", "subject", "year");

CREATE INDEX IF NOT EXISTS "documents_userId_subject_chapterNumber_idx" 
ON "documents"("userId", "subject", "chapterNumber");

CREATE INDEX IF NOT EXISTS "content_blocks_documentId_blockType_chapterNumber_idx" 
ON "content_blocks"("documentId", "blockType", "chapterNumber");

CREATE INDEX IF NOT EXISTS "content_blocks_documentId_pageNumber_idx" 
ON "content_blocks"("documentId", "pageNumber");

-- Add helpful comments
COMMENT ON COLUMN "documents"."documentType" IS 'textbook, past_paper, notes, reference, question_bank';
COMMENT ON COLUMN "documents"."educationSystem" IS 'punjab_board, federal_board, css_exam, nust, etc.';
COMMENT ON COLUMN "documents"."level" IS 'matric, fsc, bs, ms, phd, competitive';
COMMENT ON COLUMN "documents"."class" IS '9, 10 (matric), 11, 12 (fsc), BS-1 to BS-8 (bs), etc.';
COMMENT ON COLUMN "documents"."uploadMode" IS 'auto, chapter, fullbook, manual';
COMMENT ON COLUMN "documents"."extractionMethod" IS 'pymupdf, ocr, vision_model, manual';

-- Final verification - show all document columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- ============================================
-- EXPECTED COLUMNS (should see all of these):
-- ============================================
-- id, userId, documentType, educationSystem, level, class, 
-- subject, year, board, examType, language, fileName, fileType, 
-- fileUrl, fileSize, uploadMode, chapterNumber, chapterName, 
-- processed, extractionMethod, extractionQuality, verified, uploadDate
-- ============================================
