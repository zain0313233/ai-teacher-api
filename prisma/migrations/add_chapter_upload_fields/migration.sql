-- Add chapter upload fields to documents table
ALTER TABLE "documents" 
ADD COLUMN "uploadMode" TEXT NOT NULL DEFAULT 'fullbook',
ADD COLUMN "chapterNumber" INTEGER,
ADD COLUMN "chapterName" TEXT;

-- Create index for faster chapter queries
CREATE INDEX "documents_userId_subject_chapterNumber_idx" ON "documents"("userId", "subject", "chapterNumber");
