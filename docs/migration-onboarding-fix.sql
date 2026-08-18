-- Migration: Add onboarding_completed_at column to users table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Add the column (nullable, since existing users haven't explicitly completed onboarding via the new system)
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Mark ALL existing users as onboarding-completed so they never see the modal again.
--    Only truly NEW accounts created AFTER this migration will have NULL (and thus see onboarding).
UPDATE users SET onboarding_completed_at = NOW() WHERE onboarding_completed_at IS NULL;
