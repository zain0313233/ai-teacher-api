-- Scheduled assignment release (Phase B Step 2)
-- Run: psql $DATABASE_URL -f prisma/migrations/add_assignment_publish_at.sql

ALTER TABLE "class_assignments"
  ADD COLUMN IF NOT EXISTS "publishAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "publishNotifiedAt" TIMESTAMP(3);

-- Existing assignments were already visible to students — mark notifications as sent
UPDATE "class_assignments"
SET "publishNotifiedAt" = "createdAt"
WHERE "publishNotifiedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "class_assignments_publishAt_idx"
  ON "class_assignments"("publishAt");
