-- ============================================
-- CRITICAL: Add level and class columns to documents table
-- Run this in Neon Console SQL Editor
-- ============================================

-- Step 1: Add level column (required field with default)
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "level" TEXT NOT NULL DEFAULT 'matric';

-- Step 2: Add class column (optional field)
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "class" TEXT;

-- Step 3: Add other missing columns from schema
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "documentType" TEXT NOT NULL DEFAULT 'textbook',
ADD COLUMN IF NOT EXISTS "educationSystem" TEXT NOT NULL DEFAULT 'punjab_board',
ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'english',
ADD COLUMN IF NOT EXISTS "extractionMethod" TEXT,
ADD COLUMN IF NOT EXISTS "extractionQuality" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;

-- Step 4: Create ContentBlock table (if it doesn't exist)
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

-- Step 5: Add foreign key constraint for ContentBlock (if not exists)
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

-- Step 6: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "documents_userId_educationSystem_level_subject_idx" 
ON "documents"("userId", "educationSystem", "level", "subject");

CREATE INDEX IF NOT EXISTS "documents_board_class_subject_year_idx" 
ON "documents"("board", "class", "subject", "year");

CREATE INDEX IF NOT EXISTS "content_blocks_documentId_blockType_chapterNumber_idx" 
ON "content_blocks"("documentId", "blockType", "chapterNumber");

CREATE INDEX IF NOT EXISTS "content_blocks_documentId_pageNumber_idx" 
ON "content_blocks"("documentId", "pageNumber");

-- Step 7: Add comments for documentation
COMMENT ON COLUMN "documents"."level" IS 'Education level: matric, fsc, bs, ms, phd, competitive';
COMMENT ON COLUMN "documents"."class" IS 'Class within level: 9, 10 (matric), 11, 12 (fsc), BS-1 to BS-8 (bs), etc.';
COMMENT ON COLUMN "documents"."documentType" IS 'Type of document: textbook, past_paper, notes, reference, question_bank';
COMMENT ON COLUMN "documents"."educationSystem" IS 'Education system: punjab_board, federal_board, css_exam, nust, etc.';

-- Step 8: Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'documents' 
AND column_name IN ('level', 'class', 'documentType', 'educationSystem')
ORDER BY column_name;

-- ============================================
-- Expected output should show:
-- class          | text | YES | NULL
-- documentType   | text | NO  | 'textbook'::text
-- educationSystem| text | NO  | 'punjab_board'::text
-- level          | text | NO  | 'matric'::text
-- ============================================
