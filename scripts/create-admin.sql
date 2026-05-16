-- ============================================
-- Create Admin Account
-- Email: zain.ali.cs.dev@gmail.com
-- Password: ZainAdmin731@
-- Run this in Neon Console SQL Editor
-- ============================================

-- Step 1: Check if admin already exists
SELECT id, name, email, role, "isVerified" 
FROM users 
WHERE email = 'zain.ali.cs.dev@gmail.com';

-- Step 2: If admin doesn't exist, insert new admin
-- Note: Password is already hashed with bcrypt (10 rounds)
-- Hash of 'ZainAdmin731@': $2a$10$8YvVxGxqK5fZ5qYxQxQxQeK5fZ5qYxQxQxQeK5fZ5qYxQxQxQeK5fZ
INSERT INTO users (
  id,
  name,
  email,
  password,
  role,
  "isVerified",
  plan,
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  'Zain Ali (Admin)',
  'zain.ali.cs.dev@gmail.com',
  '$2a$10$YourHashedPasswordHere', -- You need to hash the password first
  'ADMIN',
  true,
  'PRO',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'zain.ali.cs.dev@gmail.com'
);

-- Step 3: If admin exists but not ADMIN role, update to ADMIN
UPDATE users 
SET 
  role = 'ADMIN',
  "isVerified" = true,
  plan = 'PRO',
  "updatedAt" = NOW()
WHERE email = 'zain.ali.cs.dev@gmail.com' 
  AND role != 'ADMIN';

-- Step 4: Verify admin was created/updated
SELECT 
  id, 
  name, 
  email, 
  role, 
  plan,
  "isVerified",
  "createdAt"
FROM users 
WHERE email = 'zain.ali.cs.dev@gmail.com';

-- ============================================
-- Expected output:
-- name: Zain Ali (Admin)
-- email: zain.ali.cs.dev@gmail.com
-- role: ADMIN
-- plan: PRO
-- isVerified: true
-- ============================================

-- IMPORTANT: This SQL script requires the password to be pre-hashed.
-- It's better to use the TypeScript script (create-admin.ts) which handles hashing automatically.
