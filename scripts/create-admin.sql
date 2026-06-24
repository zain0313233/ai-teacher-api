-- ============================================
-- Create Admin Account Template
-- Use TypeScript script (create-admin.ts) instead for better security
-- Run this in Neon Console SQL Editor only if TypeScript script doesn't work
-- ============================================

-- Step 1: Check if admin already exists
SELECT id, name, email, role, "isVerified" 
FROM users 
WHERE role = 'ADMIN';

-- Step 2: If admin doesn't exist, insert new admin
-- Note: Password MUST be hashed with bcrypt (10 rounds)
-- Generate hash at: https://bcrypt-generator.com/

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
  '[YOUR_ADMIN_NAME]',
  '[YOUR_ADMIN_EMAIL]',
  '[YOUR_BCRYPT_HASHED_PASSWORD]', -- Hash your password at https://bcrypt-generator.com/
  'ADMIN',
  true,
  'PRO',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE role = 'ADMIN'
);

-- Step 3: If admin exists but not ADMIN role, update to ADMIN
UPDATE users 
SET 
  role = 'ADMIN',
  "isVerified" = true,
  plan = 'PRO',
  "updatedAt" = NOW()
WHERE email = '[YOUR_ADMIN_EMAIL]' 
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
WHERE role = 'ADMIN';

-- ============================================
-- Expected output:
-- name: [YOUR_ADMIN_NAME]
-- email: [YOUR_ADMIN_EMAIL]
-- role: ADMIN
-- plan: PRO
-- isVerified: true
-- ============================================

-- IMPORTANT: 
-- 1. This SQL script requires the password to be pre-hashed.
-- 2. It's BETTER to use the TypeScript script (create-admin.ts) which handles hashing automatically.
-- 3. Usage: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123! npm run create-admin
