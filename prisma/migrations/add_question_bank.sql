-- Question bank per classroom (Phase B Step 1)
-- Run: psql $DATABASE_URL -f prisma/migrations/add_question_bank.sql

CREATE TABLE IF NOT EXISTS "question_banks" (
  "id" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "subject" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "question_banks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "question_bank_items" (
  "id" TEXT NOT NULL,
  "bankId" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "questionText" TEXT NOT NULL,
  "questionType" TEXT NOT NULL DEFAULT 'mcq',
  "options" JSONB NOT NULL,
  "correctOption" TEXT NOT NULL,
  "topicTag" TEXT,
  "concept" TEXT,
  "difficulty" TEXT,
  "explanation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "question_bank_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "question_banks_classroomId_updatedAt_idx"
  ON "question_banks"("classroomId", "updatedAt" DESC);

CREATE INDEX IF NOT EXISTS "question_bank_items_bankId_orderIndex_idx"
  ON "question_bank_items"("bankId", "orderIndex");

ALTER TABLE "question_banks"
  ADD CONSTRAINT "question_banks_classroomId_fkey"
  FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_banks"
  ADD CONSTRAINT "question_banks_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_bank_items"
  ADD CONSTRAINT "question_bank_items_bankId_fkey"
  FOREIGN KEY ("bankId") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
