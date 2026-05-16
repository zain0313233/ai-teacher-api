-- Migration: Add level and class fields to Document model
-- This migration updates the Document table to support multiple education levels

-- Step 1: Add new columns (if they don't exist)
ALTER TABLE "documents" 
ADD COLUMN IF NOT EXISTS "documentType" TEXT NOT NULL DEFAULT 'textbook',
ADD COLUMN IF NOT EXISTS "educationSystem" TEXT NOT NULL DEFAULT 'punjab_board',
ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'english',
ADD COLUMN IF NOT EXISTS "extractionMethod" TEXT,
ADD COLUMN IF NOT EXISTS "extractionQuality" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Update level column default value
ALTER TABLE "documents" 
ALTER COLUMN "level" SET DEFAULT 'matric';

-- Step 3: Update existing records with old 'secondary' level to 'matric'
UPDATE "documents" 
SET "level" = 'matric' 
WHERE "level" = 'secondary';

-- Step 4: Update existing records with old 'higher_secondary' level to 'fsc'
UPDATE "documents" 
SET "level" = 'fsc' 
WHERE "level" = 'higher_secondary';

-- Step 5: Create ContentBlock table (if it doesn't exist)
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

-- Step 6: Add foreign key constraint for ContentBlock
ALTER TABLE "content_blocks" 
ADD CONSTRAINT "content_blocks_documentId_fkey" 
FOREIGN KEY ("documentId") 
REFERENCES "documents"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 7: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "documents_educationSystem_level_subject_idx" 
ON "documents"("educationSystem", "level", "subject");

CREATE INDEX IF NOT EXISTS "documents_board_class_subject_year_idx" 
ON "documents"("board", "class", "subject", "year");

CREATE INDEX IF NOT EXISTS "content_blocks_documentId_blockType_chapterNumber_idx" 
ON "content_blocks"("documentId", "blockType", "chapterNumber");

CREATE INDEX IF NOT EXISTS "content_blocks_documentId_pageNumber_idx" 
ON "content_blocks"("documentId", "pageNumber");

-- Step 8: Add comments for documentation
COMMENT ON COLUMN "documents"."level" IS 'Education level: matric, fsc, bs, ms, phd, competitive';
COMMENT ON COLUMN "documents"."class" IS 'Class within level: 9, 10 (matric), 11, 12 (fsc), BS-1 to BS-8 (bs), etc.';
COMMENT ON COLUMN "documents"."documentType" IS 'Type of document: textbook, past_paper, notes, reference, question_bank';
COMMENT ON COLUMN "documents"."educationSystem" IS 'Education system: punjab_board, federal_board, css_exam, nust, etc.';
COMMENT ON COLUMN "documents"."extractionMethod" IS 'Method used for extraction: pymupdf, ocr, vision_model, manual';
COMMENT ON COLUMN "documents"."extractionQuality" IS 'Quality score of extraction (0.0 to 1.0)';

-- Migration complete
