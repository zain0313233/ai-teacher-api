-- In-app notifications + email preference flags
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "emailNotifyAssignments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "emailNotifyDueReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "inAppNotifications" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "link" TEXT,
  "metadata" JSONB,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx"
  ON "notifications" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "notifications_userId_readAt_idx"
  ON "notifications" ("userId", "readAt");

ALTER TABLE "notifications"
  DROP CONSTRAINT IF EXISTS "notifications_userId_fkey";
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "assignment_reminders" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reminderType" TEXT NOT NULL DEFAULT 'due_24h',
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assignment_reminders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "assignment_reminders_assignmentId_userId_reminderType_key"
  ON "assignment_reminders" ("assignmentId", "userId", "reminderType");

ALTER TABLE "assignment_reminders"
  DROP CONSTRAINT IF EXISTS "assignment_reminders_assignmentId_fkey";
ALTER TABLE "assignment_reminders"
  ADD CONSTRAINT "assignment_reminders_assignmentId_fkey"
  FOREIGN KEY ("assignmentId") REFERENCES "class_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
