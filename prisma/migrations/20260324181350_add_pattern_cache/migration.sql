/*
  Warnings:

  - Added the required column `class` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `exams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "chapterEnd" INTEGER,
ADD COLUMN     "chapterStart" INTEGER,
ADD COLUMN     "class" TEXT NOT NULL,
ADD COLUMN     "fileUrls" TEXT[],
ADD COLUMN     "patternId" TEXT,
ADD COLUMN     "section" TEXT NOT NULL;

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

-- CreateTable
CREATE TABLE "past_papers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "board" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "past_papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "past_paper_questions" (
    "id" TEXT NOT NULL,
    "pastPaperId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "chapter" INTEGER,
    "marks" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "lastAppeared" INTEGER NOT NULL,
    "consistencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clusterId" TEXT,

    CONSTRAINT "past_paper_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pattern_clusters" (
    "id" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "chapter" INTEGER,
    "totalFrequency" INTEGER NOT NULL DEFAULT 0,
    "priorityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consistencyBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trend" TEXT NOT NULL DEFAULT 'STABLE',
    "yearsAppeared" INTEGER[],
    "sampleQuestions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pattern_clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pattern_cache" (
    "id" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "country" TEXT,
    "subject" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "pattern" JSONB NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pattern_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chapters_documentId_chapterNumber_key" ON "chapters"("documentId", "chapterNumber");

-- CreateIndex
CREATE INDEX "past_papers_userId_subject_year_idx" ON "past_papers"("userId", "subject", "year");

-- CreateIndex
CREATE INDEX "past_papers_board_class_subject_idx" ON "past_papers"("board", "class", "subject");

-- CreateIndex
CREATE INDEX "past_paper_questions_chapter_idx" ON "past_paper_questions"("chapter");

-- CreateIndex
CREATE INDEX "past_paper_questions_concept_method_structure_idx" ON "past_paper_questions"("concept", "method", "structure");

-- CreateIndex
CREATE INDEX "pattern_clusters_concept_method_structure_difficulty_idx" ON "pattern_clusters"("concept", "method", "structure", "difficulty");

-- CreateIndex
CREATE INDEX "pattern_clusters_priorityScore_idx" ON "pattern_clusters"("priorityScore");

-- CreateIndex
CREATE INDEX "pattern_clusters_subject_class_chapter_idx" ON "pattern_clusters"("subject", "class", "chapter");

-- CreateIndex
CREATE UNIQUE INDEX "pattern_clusters_concept_method_structure_difficulty_subjec_key" ON "pattern_clusters"("concept", "method", "structure", "difficulty", "subject", "class");

-- CreateIndex
CREATE INDEX "pattern_cache_board_subject_class_idx" ON "pattern_cache"("board", "subject", "class");

-- CreateIndex
CREATE UNIQUE INDEX "pattern_cache_board_subject_class_year_key" ON "pattern_cache"("board", "subject", "class", "year");

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "past_papers" ADD CONSTRAINT "past_papers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "past_paper_questions" ADD CONSTRAINT "past_paper_questions_pastPaperId_fkey" FOREIGN KEY ("pastPaperId") REFERENCES "past_papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "past_paper_questions" ADD CONSTRAINT "past_paper_questions_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "pattern_clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
