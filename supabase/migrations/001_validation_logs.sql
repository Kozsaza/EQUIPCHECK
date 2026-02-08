-- Validation Logs: metadata-only tracking for analytics
-- No file contents, item descriptions, or part numbers stored.
-- Run this in the Supabase SQL Editor.

create table public.validation_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references public.profiles(id) on delete set null,
  session_id text,
  industry_detected text,
  match_count integer not null default 0,
  mismatch_count integer not null default 0,
  missing_count integer not null default 0,
  extra_count integer not null default 0,
  review_count integer not null default 0,
  critical_count integer not null default 0,
  processing_time_ms integer,
  confidence_level text check (confidence_level in ('HIGH', 'MEDIUM', 'LOW')),
  validation_status text check (validation_status in ('PASS', 'FAIL', 'REVIEW_NEEDED')),
  is_demo boolean not null default false,
  source text  -- e.g. 'google', 'twitter', 'direct' from ?ref= param
);

-- RLS: users can read their own rows; service role inserts bypass RLS
alter table public.validation_logs enable row level security;

create policy "Users can view own logs"
  on public.validation_logs for select
  using (auth.uid() = user_id);

-- Indexes for analytics queries
create index idx_validation_logs_session_id on public.validation_logs (session_id);
create index idx_validation_logs_created_at on public.validation_logs (created_at);
create index idx_validation_logs_user_id on public.validation_logs (user_id);
create index idx_validation_logs_is_demo on public.validation_logs (is_demo);
