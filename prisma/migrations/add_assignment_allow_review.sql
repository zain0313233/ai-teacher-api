-- Allow teachers to disable answer review after class assignment submit
ALTER TABLE "class_assignments"
ADD COLUMN IF NOT EXISTS "allowReviewAfterSubmit" BOOLEAN NOT NULL DEFAULT true;
