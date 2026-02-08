-- Migration: Fix plan column constraint to match application code
-- Old values: 'free', 'starter', 'pro'
-- New values: 'free', 'professional', 'business'

-- Step 1: Update any existing rows with old plan names
UPDATE public.profiles SET plan = 'professional' WHERE plan = 'starter';
UPDATE public.profiles SET plan = 'business' WHERE plan = 'pro';

-- Step 2: Drop the old constraint and add the new one
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'professional', 'business'));
