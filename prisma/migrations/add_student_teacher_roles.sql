-- ============================================
-- Add TEACHER role (USER already exists for students)
-- Run this in Neon Console SQL Editor
-- ============================================

-- Step 1: Add TEACHER role to the enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TEACHER';

-- Step 2: Verify the enum values
SELECT unnest(enum_range(NULL::\"UserRole\")) as role;

-- ============================================
-- Expected output:
-- USER     (Students - existing)
-- ADMIN    (Admins - existing)
-- TEACHER  (Teachers - newly added)
-- ============================================

-- Note: After this migration, you can manually update specific users to TEACHER role:
-- UPDATE "users" SET "role" = 'TEACHER' WHERE email = 'teacher@example.com';

-- Check current user distribution
SELECT role, COUNT(*) as count
FROM "users"
GROUP BY role
ORDER BY role;
