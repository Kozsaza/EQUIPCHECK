-- EquipCheck Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  stripe_customer_id text,
  plan text default 'free' check (plan in ('free', 'professional', 'business')),
  validations_this_month integer default 0,
  validation_reset_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Specs library (user's saved master specifications)
create table public.specs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  description text,
  content jsonb not null, -- parsed spec data
  original_filename text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Validation history
create table public.validations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  spec_id uuid references public.specs on delete set null,
  spec_name text not null, -- denormalized for history
  equipment_data jsonb not null, -- uploaded equipment list
  result jsonb not null, -- AI validation result
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  equipment_filename text,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.specs enable row level security;
alter table public.validations enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own specs" on public.specs for select using (auth.uid() = user_id);
create policy "Users can insert own specs" on public.specs for insert with check (auth.uid() = user_id);
create policy "Users can update own specs" on public.specs for update using (auth.uid() = user_id);
create policy "Users can delete own specs" on public.specs for delete using (auth.uid() = user_id);

create policy "Users can view own validations" on public.validations for select using (auth.uid() = user_id);
create policy "Users can insert own validations" on public.validations for insert with check (auth.uid() = user_id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
