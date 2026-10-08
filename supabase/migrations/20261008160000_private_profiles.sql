-- Fix profiles privacy leak (Paul's request 2026-10-08, refining the website).
--
-- The 20261008040000 migration added IRL fields (first_name_irl, last_name_irl,
-- country_code, date_of_birth) to public.profiles, which has a public-read
-- policy. That exposed private identity data to everyone. This migration:
--   1. Creates private_profiles for IRL data (owner-only RLS, no public reads).
--   2. Drops the IRL columns from public.profiles.

create table if not exists public.private_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name_irl text,
  last_name_irl text,
  country_code text,
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.private_profiles enable row level security;

-- Owner can read their own private data. No one else, not even anon.
drop policy if exists "private profiles owner read" on public.private_profiles;
create policy "private profiles owner read"
  on public.private_profiles for select
  to authenticated
  using (user_id = auth.uid());

-- Owner can insert their own private data (during signup).
drop policy if exists "private profiles owner insert" on public.private_profiles;
create policy "private profiles owner insert"
  on public.private_profiles for insert
  to authenticated
  with check (user_id = auth.uid());

-- Owner can update their own private data.
drop policy if exists "private profiles owner update" on public.private_profiles;
create policy "private profiles owner update"
  on public.private_profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Remove IRL columns from the public profiles table.
alter table public.profiles drop column if exists first_name_irl;
alter table public.profiles drop column if exists last_name_irl;
alter table public.profiles drop column if exists country_code;
alter table public.profiles drop column if exists date_of_birth;

-- Safety: ensure the public-read policy only applies to the public table
-- (it already does — private_profiles has no public policy).
