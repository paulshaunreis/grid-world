-- GridWorld security questions for account recovery (Paul's request 2026-10-08)
-- Users select 3 questions during signup; answers are stored as SHA-256 hashes.
-- NEVER store plaintext answers. Recovery flow compares hashes.

create table if not exists public.grid_security_questions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- Three question/answer-hash pairs. Questions from an allowlist (client-side).
  q1_text text not null,
  q1_hash text not null,
  q2_text text not null,
  q2_hash text not null,
  q3_text text not null,
  q3_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.grid_security_questions enable row level security;

-- No read access for anyone (not even the owner — answers are verify-only).
-- Service role can read for the recovery flow.

-- Users can insert their own questions once (during signup).
drop policy if exists "security questions self insert" on public.grid_security_questions;
create policy "security questions self insert"
  on public.grid_security_questions for insert
  to authenticated
  with check (user_id = auth.uid());

-- Users can update their own questions (if they want to change them).
drop policy if exists "security questions self update" on public.grid_security_questions;
create policy "security questions self update"
  on public.grid_security_questions for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- No delete: questions persist for account recovery.
-- No select: answers are verify-only via a future recovery RPC.

-- IRL name and country: extend profiles (private fields, never public).
-- Create profiles table if it doesn't exist yet (GridAuthService expects it).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles are readable by everyone (public handle/avatar), writable by owner.
drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

alter table public.profiles add column if not exists first_name_irl text;
alter table public.profiles add column if not exists last_name_irl text;
alter table public.profiles add column if not exists country_code text;
alter table public.profiles add column if not exists date_of_birth date;
