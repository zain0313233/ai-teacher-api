-- Light proctoring toggle for timed class assignments (Phase B Step 3)
ALTER TABLE "class_assignments"
  ADD COLUMN IF NOT EXISTS "proctoringEnabled" BOOLEAN NOT NULL DEFAULT false;
