-- Validation flags: user-reported AI accuracy corrections
create table if not exists public.validation_flags (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references public.profiles(id) on delete set null,
  validation_id uuid references public.validations(id) on delete set null,
  industry_detected text,
  original_status text not null,
  user_correction text not null check (user_correction in (
    'should_be_match', 'should_be_mismatch', 'wrong_quantity', 'duplicated', 'other'
  )),
  item_description_spec text not null,
  item_description_equipment text,
  user_note text,
  validation_pass text check (validation_pass in ('single_pass', 'dual_pass'))
);

alter table public.validation_flags enable row level security;

-- Anyone can insert flags (anonymous demo users too)
create policy "Anyone can insert flags"
  on public.validation_flags for insert
  with check (true);

-- Users can view their own flags
create policy "Users can view own flags"
  on public.validation_flags for select
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_validation_flags_created_at
  on public.validation_flags (created_at);
create index if not exists idx_validation_flags_user_correction
  on public.validation_flags (user_correction);
