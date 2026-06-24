-- Classroom feature tables (run in Neon SQL editor or via prisma migrate)
-- Affected tables: classrooms, class_enrollments, class_materials, class_assignments
-- Also adds is_class_template to quiz_sessions

ALTER TABLE "quiz_sessions"
  ADD COLUMN IF NOT EXISTS "isClassTemplate" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "classrooms" (
  "id" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "classGrade" TEXT,
  "board" TEXT,
  "joinCode" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "classrooms_joinCode_key" UNIQUE ("joinCode"),
  CONSTRAINT "classrooms_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "classrooms_teacherId_idx" ON "classrooms"("teacherId");

CREATE TABLE IF NOT EXISTS "class_enrollments" (
  "id" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "class_enrollments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "class_enrollments_classroomId_studentId_key" UNIQUE ("classroomId", "studentId"),
  CONSTRAINT "class_enrollments_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "class_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "class_enrollments_studentId_idx" ON "class_enrollments"("studentId");

CREATE TABLE IF NOT EXISTS "class_materials" (
  "id" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "documentId" TEXT,
  "pastPaperId" TEXT,
  "title" TEXT,
  "note" TEXT,
  "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "class_materials_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "class_materials_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "class_materials_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "class_materials_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "class_materials_pastPaperId_fkey" FOREIGN KEY ("pastPaperId") REFERENCES "past_papers"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "class_materials_classroomId_sharedAt_idx" ON "class_materials"("classroomId", "sharedAt" DESC);

CREATE TABLE IF NOT EXISTS "class_assignments" (
  "id" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "quizSessionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "instructions" TEXT,
  "assignmentMode" TEXT NOT NULL DEFAULT 'practice',
  "dueAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "class_assignments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "class_assignments_quizSessionId_key" UNIQUE ("quizSessionId"),
  CONSTRAINT "class_assignments_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "class_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "class_assignments_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "class_assignments_classroomId_status_idx" ON "class_assignments"("classroomId", "status");
