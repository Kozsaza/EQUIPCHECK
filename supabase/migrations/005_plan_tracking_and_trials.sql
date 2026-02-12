-- Add plan and pipeline_depth tracking to validation_logs
ALTER TABLE public.validation_logs
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS pipeline_depth text;

-- Add trial_end to profiles for Stripe trial tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone;

-- Index for plan-based analytics
CREATE INDEX IF NOT EXISTS idx_validation_logs_plan
  ON public.validation_logs (plan)
  WHERE plan IS NOT NULL;
