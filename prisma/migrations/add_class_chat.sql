CREATE TABLE IF NOT EXISTS "class_messages" (
  "id" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "messageType" TEXT NOT NULL DEFAULT 'text',
  "content" TEXT,
  "fileUrl" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "fileSize" INTEGER,
  "durationSec" INTEGER,
  "replyToId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "class_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "class_messages_classroomId_createdAt_idx"
  ON "class_messages" ("classroomId", "createdAt" DESC);

ALTER TABLE "class_messages" DROP CONSTRAINT IF EXISTS "class_messages_classroomId_fkey";
ALTER TABLE "class_messages"
  ADD CONSTRAINT "class_messages_classroomId_fkey"
  FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_messages" DROP CONSTRAINT IF EXISTS "class_messages_senderId_fkey";
ALTER TABLE "class_messages"
  ADD CONSTRAINT "class_messages_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_messages" DROP CONSTRAINT IF EXISTS "class_messages_replyToId_fkey";
ALTER TABLE "class_messages"
  ADD CONSTRAINT "class_messages_replyToId_fkey"
  FOREIGN KEY ("replyToId") REFERENCES "class_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
