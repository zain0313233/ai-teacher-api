-- ============================================
-- Verify and Activate Admin Account
-- Run this in Neon Console SQL Editor
-- ============================================

-- Step 1: Check if admin exists
SELECT 
  id, 
  name, 
  email, 
  role, 
  "isVerified",
  plan,
  "createdAt"
FROM users 
WHERE email = 'zain.ali.cs.dev@gmail.com';

-- Step 2: Verify admin and upgrade to PRO plan
UPDATE users 
SET 
  "isVerified" = true,
  plan = 'PRO',
  "updatedAt" = NOW()
WHERE email = 'zain.ali.cs.dev@gmail.com';

-- Step 3: Verify the update worked
SELECT 
  id, 
  name, 
  email, 
  role, 
  "isVerified",
  plan,
  "createdAt",
  "updatedAt"
FROM users 
WHERE email = 'zain.ali.cs.dev@gmail.com';

-- ============================================
-- Expected output after update:
-- name: Zain Ali (Admin)
-- email: zain.ali.cs.dev@gmail.com
-- role: ADMIN
-- isVerified: true
-- plan: PRO
-- ============================================

-- Step 4: Check all user roles
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;
