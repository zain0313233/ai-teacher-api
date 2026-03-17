-- AlterTable
ALTER TABLE "documents" ADD COLUMN "subject" TEXT;

-- AlterTable
ALTER TABLE "exams" 
ADD COLUMN "class" TEXT NOT NULL DEFAULT '',
ADD COLUMN "section" TEXT NOT NULL DEFAULT '',
ADD COLUMN "chapterStart" INTEGER,
ADD COLUMN "chapterEnd" INTEGER,
ADD COLUMN "patternId" TEXT,
ADD COLUMN "fileUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "examType" SET NOT NULL;

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "chapterName" TEXT NOT NULL,
    "startPosition" INTEGER NOT NULL,
    "endPosition" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chapters_documentId_chapterNumber_key" ON "chapters"("documentId", "chapterNumber");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
