-- Timed class assessments: optional duration in minutes
ALTER TABLE "class_assignments"
  ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER;
