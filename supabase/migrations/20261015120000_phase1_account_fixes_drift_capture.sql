-- Phase 1 — User Accounts: drift-capture migration (2026-10-15).
--
-- Captures the account-surface schema that exists LIVE but was never committed
-- to the repo (Phase 0: live has 57 applied migrations vs ~22 in repo).
-- Applies cleanly to BOTH (a) a fresh repo-migrated DB and (b) live, as a
-- no-op where objects already exist. Every statement below is idempotent:
-- ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS / CREATE OR REPLACE
-- FUNCTION / DROP POLICY IF EXISTS + CREATE POLICY / CREATE INDEX IF NOT EXISTS.
--
-- LIVE APPLY IS A SEPARATE PAUL-APPROVED STEP. Do NOT run `supabase db push`
-- or apply this file in the Dashboard without Paul's explicit approval.
-- The client changes in this branch (plaintext recovery answers, single
-- signup RPC) must deploy TOGETHER with this migration: the v2 recovery
-- RPCs below expect PLAINTEXT answers, and the old client sends SHA-256
-- hashes, which will NOT verify against v2 rows.
--
-- Deliberately NOT captured here (need a live DDL snapshot first — plan §F10.5):
--   grid_complete_profile, grid_profile_upsert, and the ~35 other live
--   migrations' objects whose bodies were never committed to the repo.
--   Do NOT invent bodies for them. Their live definitions are authoritative
--   until a pg_get_functiondef snapshot is reviewed object by object.
--
-- TURNSTILE_SECRET_KEY, Auth settings (PKCE vs implicit, redirect allowlist,
-- rate limits), and the handle-dedup / grants decisions are Paul-only gates
-- (plan §F19). Nothing in this file guesses them.
--
-- Team backfill below uses the UUID already recorded in repo migration
-- 20261008170000_beta_access.sql step 5 ("Paul's account ... confirmed
-- signup 2026-10-08"). It is NOT a guess. Paul: please confirm it is still
-- the right id before applying to live.

-- pgcrypto (bcrypt + SHA-256) lives in the extensions schema on Supabase.
-- Functions below call it as extensions.crypt / extensions.gen_salt /
-- extensions.digest because they run with SET search_path = public.
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- F8. profiles.language (the one schema gap Phase 0 left: live profiles has
-- no language column; join.ts writes it, which could fail session signup).
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists language text;

-- ---------------------------------------------------------------------------
-- profiles columns for the account flows (live has them; no repo migration
-- creates them — audit A4). Without these, the signup RPC below would fail
-- at runtime on a fresh repo-migrated DB, and GridAuthService.profile()
-- would throw on every call. Types match client usage (avatar_customization
-- is written as a JSON object). Live-only columns NOT captured here because
-- their exact live types are unknown (need a pg DDL snapshot first):
-- theme, layout, visibility, profile_version, bio, status_text, cover_url,
-- gender_identity, pronouns, orientation, shop_slug.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists handle text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists avatar_image_url text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists middle_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists name_visibility text not null default 'display_only';
alter table public.profiles add column if not exists onboarding_complete boolean not null default false;
alter table public.profiles add column if not exists avatar_style text;
alter table public.profiles add column if not exists avatar_customization jsonb;
alter table public.profiles add column if not exists avatar_ready boolean not null default false;
alter table public.profiles add column if not exists account_created_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- F12. profiles.beta_status (absent live; accessGate selects it, so every
-- signed-in user read as 'pending' / fail-closed until this lands).
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists beta_status text not null default 'pending'
  check (beta_status in ('pending', 'approved', 'rejected', 'team'));

-- Paul's account is team (UUID recorded in 20261008170000_beta_access.sql).
-- On a fresh repo-migrated DB this is a no-op duplicate. Paul: confirm the id.
update public.profiles
  set beta_status = 'team'
  where id = '9a331e1b-b14c-41b5-af2c-f543a4c4ae48'
    and beta_status <> 'team';

-- Helper for RLS policies (from 20261008170000_beta_access.sql; absent live
-- per Phase 0's function list, so CREATE OR REPLACE creates it there).
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

-- ---------------------------------------------------------------------------
-- F9 (partial). profiles.handle_normalized — column + backfill only.
-- The BEFORE INSERT/UPDATE trigger and the UNIQUE index are in the DRAFT
-- migration supabase/drafts/DO-NOT-APPLY_handle_uniqueness.sql. Do NOT apply
-- the UNIQUE index until the dedup report is reviewed and Paul approves.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists handle_normalized text;

update public.profiles
  set handle_normalized = lower(trim(handle))
  where handle is not null
    and handle_normalized is null;

-- ---------------------------------------------------------------------------
-- F12. grid_beta_applications (does not exist live; beta.ts inserts into it).
-- Table + RLS policies copied from 20261008170000_beta_access.sql.
-- ---------------------------------------------------------------------------
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

drop policy if exists "beta applications public insert" on public.grid_beta_applications;
create policy "beta applications public insert"
  on public.grid_beta_applications for insert
  to anon, authenticated
  with check (true);

drop policy if exists "beta applications self read" on public.grid_beta_applications;
create policy "beta applications self read"
  on public.grid_beta_applications for select
  to authenticated
  using (user_id = auth.uid() or email = (select email from auth.users where id = auth.uid()));

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

-- ---------------------------------------------------------------------------
-- F4. grid_security_questions.hash_version — v1 = legacy unsalted SHA-256,
-- v2 = bcrypt. Existing rows stay v1 (no mass re-hash without plaintext);
-- v1 rows upgrade to v2 transparently on first successful recovery verify.
-- ---------------------------------------------------------------------------
alter table public.grid_security_questions
  add column if not exists hash_version smallint not null default 1;

-- ---------------------------------------------------------------------------
-- F3. grid_recovery_attempts — per-email recovery throttling.
-- RLS enabled with NO policies: no direct client access; only the
-- SECURITY DEFINER RPCs below read/write it. Stale rows (>24h) are deleted
-- on every RPC call (no pg_cron in Phase 1).
-- ---------------------------------------------------------------------------
create table if not exists public.grid_recovery_attempts (
  id bigint generated always as identity primary key,
  email text not null,
  attempted_at timestamptz not null default now(),
  success boolean not null default false
);

alter table public.grid_recovery_attempts enable row level security;

create index if not exists grid_recovery_attempts_email_time_idx
  on public.grid_recovery_attempts (lower(email), attempted_at);

-- ---------------------------------------------------------------------------
-- F13 + F3 + F4. Recovery RPCs, v2: throttled + bcrypt, plaintext-in.
--
-- BREAKING CHANGE vs the 20261008060000 versions, shipped with the matching
-- client in this branch: verify_recovery_answers now takes PLAINTEXT answers
-- (parameter names p_h1/p_h2/p_h3 are KEPT so existing call shapes still
-- resolve) and compares server-side. v1 rows are compared with legacy
-- SHA-256(lower(trim())) and UPGRADED to bcrypt in the same transaction on
-- success. v2 rows are compared with extensions.crypt().
--
-- Throttling: >= 5 FAILED verify attempts for an email in the last 15
-- minutes locks that email out. verify returns NULL on lockout (distinct
-- from false = wrong answers, true = verified). get_recovery_questions
-- returns EMPTY on lockout — identical shape to "no questions", no oracle.
-- Attempts made while locked out are NOT logged (no sliding-window extension).
-- ---------------------------------------------------------------------------

-- Get the 3 security question texts for an account (no hashes exposed).
create or replace function public.get_recovery_questions(p_email text)
returns table (q1 text, q2 text, q3 text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_failures integer;
begin
  -- Prune stale attempt rows (>24h).
  delete from public.grid_recovery_attempts
    where attempted_at < now() - interval '24 hours';

  -- Lockout check: >= 5 failed verify attempts in the last 15 minutes.
  select count(*) into v_failures
    from public.grid_recovery_attempts
    where lower(email) = lower(p_email)
      and success = false
      and attempted_at > now() - interval '15 minutes';
  if v_failures >= 5 then
    -- Return empty: indistinguishable from "no questions" by design.
    return;
  end if;

  -- Find user by email (case-insensitive).
  select id into v_user_id from auth.users where lower(email) = lower(p_email) limit 1;
  if v_user_id is null then
    -- Return empty (don't reveal whether the email exists).
    return;
  end if;

  return query
    select sq.q1_text, sq.q2_text, sq.q3_text
    from public.grid_security_questions sq
    where sq.user_id = v_user_id;
end;
$$;

-- Verify the 3 answers. Returns true only if ALL match, false on mismatch,
-- NULL on lockout (>= 5 failed attempts in the last 15 minutes).
-- NOTE: p_h1/p_h2/p_h3 are PLAINTEXT answers in v2 (names kept for call-shape
-- compatibility with the pre-v2 client). Never log plaintext answers.
create or replace function public.verify_recovery_answers(p_email text, p_h1 text, p_h2 text, p_h3 text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_row record;
  v_match boolean := false;
  v_failures integer;
begin
  -- Prune stale attempt rows (>24h).
  delete from public.grid_recovery_attempts
    where attempted_at < now() - interval '24 hours';

  -- Lockout check (attempts while locked out are not logged).
  select count(*) into v_failures
    from public.grid_recovery_attempts
    where lower(email) = lower(p_email)
      and success = false
      and attempted_at > now() - interval '15 minutes';
  if v_failures >= 5 then
    return null;
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(p_email) limit 1;
  if v_user_id is null then
    insert into public.grid_recovery_attempts (email, success) values (p_email, false);
    return false;
  end if;

  select sq.q1_hash, sq.q2_hash, sq.q3_hash, sq.hash_version
    into v_row
    from public.grid_security_questions sq
    where sq.user_id = v_user_id;
  if not found then
    insert into public.grid_recovery_attempts (email, success) values (p_email, false);
    return false;
  end if;

  if coalesce(v_row.hash_version, 1) = 2 then
    -- v2: bcrypt compare. Guard against malformed stored hashes: crypt()
    -- raises on an invalid salt, so only compare well-formed bcrypt hashes.
    v_match :=
      (v_row.q1_hash like '$2a$%' or v_row.q1_hash like '$2b$%')
      and (v_row.q2_hash like '$2a$%' or v_row.q2_hash like '$2b$%')
      and (v_row.q3_hash like '$2a$%' or v_row.q3_hash like '$2b$%')
      and extensions.crypt(trim(p_h1), v_row.q1_hash) = v_row.q1_hash
      and extensions.crypt(trim(p_h2), v_row.q2_hash) = v_row.q2_hash
      and extensions.crypt(trim(p_h3), v_row.q3_hash) = v_row.q3_hash;
  else
    -- v1: legacy unsalted SHA-256(lower(trim(answer))) compare.
    v_match :=
      encode(extensions.digest(lower(trim(p_h1)), 'sha256'), 'hex') = v_row.q1_hash
      and encode(extensions.digest(lower(trim(p_h2)), 'sha256'), 'hex') = v_row.q2_hash
      and encode(extensions.digest(lower(trim(p_h3)), 'sha256'), 'hex') = v_row.q3_hash;
  end if;

  if v_match then
    -- Upgrade-on-verify: re-hash the just-supplied plaintext answers to v2
    -- bcrypt in the same transaction. Legacy users migrate transparently.
    update public.grid_security_questions
      set q1_hash = extensions.crypt(trim(p_h1), extensions.gen_salt('bf')),
          q2_hash = extensions.crypt(trim(p_h2), extensions.gen_salt('bf')),
          q3_hash = extensions.crypt(trim(p_h3), extensions.gen_salt('bf')),
          hash_version = 2,
          updated_at = now()
      where user_id = v_user_id;
    -- Success clears this email's failures (ends any lockout window).
    delete from public.grid_recovery_attempts
      where lower(email) = lower(p_email) and success = false;
    insert into public.grid_recovery_attempts (email, success) values (p_email, true);
    return true;
  end if;

  insert into public.grid_recovery_attempts (email, success) values (p_email, false);
  return false;
end;
$$;

-- Allow anon + authenticated to call (recovery happens before login).
grant execute on function public.get_recovery_questions(text) to anon, authenticated;
grant execute on function public.verify_recovery_answers(text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- F2. grid_complete_signup — the SINGLE atomic signup RPC.
--
-- One transaction writes profiles + private_profiles +
-- grid_security_questions (v2 bcrypt hashes). Any failure rolls the whole
-- thing back: no partial accounts. The client keeps its pending payload and
-- offers retry on failure; the starter grant stays best-effort OUTSIDE this
-- RPC (client calls ensureStarterGrant separately, non-fatal).
--
-- Ownership: operates ONLY on auth.uid() — the caller's own account.
-- beta_status is insert-only here: new rows get 'pending'; existing rows
-- keep their beta_status (never overwritten by this RPC).
-- ---------------------------------------------------------------------------
create or replace function public.grid_complete_signup(
  p_handle text,
  p_display_name text,
  p_first_name text,
  p_middle_name text,
  p_last_name text,
  p_name_visibility text,
  p_language text,
  p_avatar_style text,
  p_avatar_customization jsonb default null,
  p_first_name_irl text default null,
  p_last_name_irl text default null,
  p_country_code text default null,
  p_date_of_birth date default null,
  p_q1_text text default null,
  p_q1_answer text default null,
  p_q2_text text default null,
  p_q2_answer text default null,
  p_q3_text text default null,
  p_q3_answer text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_handle text;
  v_display text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  v_handle := trim(coalesce(p_handle, ''));
  if v_handle = '' then
    raise exception 'handle is required';
  end if;
  v_display := nullif(trim(coalesce(p_display_name, '')), '');
  if v_display is null then
    v_display := v_handle;
  end if;

  if nullif(trim(coalesce(p_q1_text, '')), '') is null
     or nullif(trim(coalesce(p_q1_answer, '')), '') is null
     or nullif(trim(coalesce(p_q2_text, '')), '') is null
     or nullif(trim(coalesce(p_q2_answer, '')), '') is null
     or nullif(trim(coalesce(p_q3_text, '')), '') is null
     or nullif(trim(coalesce(p_q3_answer, '')), '') is null then
    raise exception 'three security questions and answers are required';
  end if;

  -- profiles: insert-only beta_status ('pending'); existing rows keep theirs.
  insert into public.profiles (
    id, handle, handle_normalized, display_name,
    first_name, middle_name, last_name, name_visibility,
    language, avatar_style, avatar_customization,
    onboarding_complete, beta_status
  ) values (
    v_uid, v_handle, lower(v_handle), v_display,
    nullif(trim(coalesce(p_first_name, '')), ''),
    nullif(trim(coalesce(p_middle_name, '')), ''),
    nullif(trim(coalesce(p_last_name, '')), ''),
    coalesce(nullif(trim(coalesce(p_name_visibility, '')), ''), 'display_only'),
    nullif(trim(coalesce(p_language, '')), ''),
    nullif(trim(coalesce(p_avatar_style, '')), ''),
    p_avatar_customization,
    true, 'pending'
  )
  on conflict (id) do update set
    handle = excluded.handle,
    handle_normalized = excluded.handle_normalized,
    display_name = excluded.display_name,
    first_name = excluded.first_name,
    middle_name = excluded.middle_name,
    last_name = excluded.last_name,
    name_visibility = excluded.name_visibility,
    language = excluded.language,
    avatar_style = excluded.avatar_style,
    avatar_customization = coalesce(excluded.avatar_customization, public.profiles.avatar_customization),
    onboarding_complete = true;

  -- private_profiles: IRL identity, owner-only table.
  insert into public.private_profiles (
    user_id, first_name_irl, last_name_irl, country_code, date_of_birth
  ) values (
    v_uid,
    nullif(trim(coalesce(p_first_name_irl, '')), ''),
    nullif(trim(coalesce(p_last_name_irl, '')), ''),
    nullif(trim(coalesce(p_country_code, '')), ''),
    p_date_of_birth
  )
  on conflict (user_id) do update set
    first_name_irl = excluded.first_name_irl,
    last_name_irl = excluded.last_name_irl,
    country_code = excluded.country_code,
    date_of_birth = excluded.date_of_birth,
    updated_at = now();

  -- grid_security_questions: v2 bcrypt hashes, written server-side.
  -- Client never hashes (and never sees a salt).
  insert into public.grid_security_questions (
    user_id, q1_text, q1_hash, q2_text, q2_hash, q3_text, q3_hash, hash_version
  ) values (
    v_uid,
    trim(p_q1_text), extensions.crypt(trim(p_q1_answer), extensions.gen_salt('bf')),
    trim(p_q2_text), extensions.crypt(trim(p_q2_answer), extensions.gen_salt('bf')),
    trim(p_q3_text), extensions.crypt(trim(p_q3_answer), extensions.gen_salt('bf')),
    2
  )
  on conflict (user_id) do update set
    q1_text = excluded.q1_text,
    q1_hash = excluded.q1_hash,
    q2_text = excluded.q2_text,
    q2_hash = excluded.q2_hash,
    q3_text = excluded.q3_text,
    q3_hash = excluded.q3_hash,
    hash_version = 2,
    updated_at = now();

  return jsonb_build_object('ok', true, 'user_id', v_uid);
end;
$$;

-- Only signed-in users complete signup (they must have a session).
grant execute on function public.grid_complete_signup(
  text, text, text, text, text, text, text, text, jsonb,
  text, text, text, date, text, text, text, text, text, text
) to authenticated;

-- ---------------------------------------------------------------------------
-- F9 (partial). grid_handle_available — live handle-availability check.
-- SECURITY DEFINER so the check works regardless of profiles RLS visibility.
-- Handles are public identifiers; "taken vs free" is the intended answer.
-- Debounced, on-blur only (not per keystroke) — see join.ts.
-- ---------------------------------------------------------------------------
create or replace function public.grid_handle_available(p_handle text)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if nullif(trim(coalesce(p_handle, '')), '') is null then
    return false;
  end if;
  return not exists (
    select 1 from public.profiles
    where handle_normalized = lower(trim(p_handle))
  );
end;
$$;

grant execute on function public.grid_handle_available(text) to anon, authenticated;
