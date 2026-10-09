-- Beta tester program + closed access control (Paul's request 2026-10-08).
--
-- GridWorld is in closed development. No public access. New signups are
-- differentiated from team members and must apply for beta access.
--
-- Access levels (profiles.beta_status):
--   'team'     — Paul + approved team humans. Full access, TEAM badge.
--   'approved' — Accepted beta testers. Full access, BETA badge.
--   'pending'  — Signed up but not yet approved. Redirected to /beta.html.
--   'rejected' — Application declined. Redirected to /beta.html.

-- 1. Add beta_status to profiles (default pending for all new signups).
alter table public.profiles
  add column if not exists beta_status text not null default 'pending'
  check (beta_status in ('pending', 'approved', 'rejected', 'team'));

-- 2. Helper: current user's access level, for use in RLS policies.
-- SECURITY DEFINER so policies can read profiles without recursion.
create or replace function public.grid_my_beta_status()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select p.beta_status from public.profiles p where p.id = auth.uid()),
    'pending'
  );
$$;

-- 3. Beta applications table.
create table if not exists public.grid_beta_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  age_range text,
  interests text,
  why_test text,
  device text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.grid_beta_applications enable row level security;

-- Anyone (even anon) can submit an application — that's the point of the page.
drop policy if exists "beta applications public insert" on public.grid_beta_applications;
create policy "beta applications public insert"
  on public.grid_beta_applications for insert
  to anon, authenticated
  with check (true);

-- Applicants can read their own application(s).
drop policy if exists "beta applications self read" on public.grid_beta_applications;
create policy "beta applications self read"
  on public.grid_beta_applications for select
  to authenticated
  using (user_id = auth.uid() or email = (select email from auth.users where id = auth.uid()));

-- Only team members can review/update applications.
drop policy if exists "beta applications team update" on public.grid_beta_applications;
create policy "beta applications team update"
  on public.grid_beta_applications for update
  to authenticated
  using (public.grid_my_beta_status() = 'team')
  with check (public.grid_my_beta_status() = 'team');

drop policy if exists "beta applications team read" on public.grid_beta_applications;
create policy "beta applications team read"
  on public.grid_beta_applications for select
  to authenticated
  using (public.grid_my_beta_status() = 'team');

-- 4. Server-side enforcement pattern for user-writable tables.
--    Client-side redirects are UX; RLS is the real gate. Any table that
--    accepts user writes should gate on grid_my_beta_status().
--    Example applied here to marketplace_ratings (user-generated content):
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'marketplace_ratings') THEN
    DROP POLICY IF EXISTS "ratings approved insert" ON public.marketplace_ratings;
    CREATE POLICY "ratings approved insert"
      ON public.marketplace_ratings FOR INSERT
      TO authenticated
      WITH CHECK (public.grid_my_beta_status() IN ('approved', 'team'));
  END IF;
END $$;

-- 5. Paul's account is team. (UID from his confirmed signup 2026-10-08.)
update public.profiles
  set beta_status = 'team'
  where id = '9a331e1b-b14c-41b5-af2c-f543a4c4ae48';

-- 6. Any other existing profiles stay 'pending' (the default) — they keep
--    their accounts but are gated to the beta page until approved.
--    (No account deletion, per Paul's direction.)
