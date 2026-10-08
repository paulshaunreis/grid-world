-- GridWorld account recovery: server-side RPCs for security question verification.
-- Paul's request 2026-10-08: account recovery page on the main site.
--
-- Flow:
--   1. Client calls get_recovery_questions(email) -> returns q1/q2/q3 texts (no hashes).
--   2. User answers; client hashes (lowercase + SHA-256, matching signup) and calls
--      verify_recovery_answers(email, h1, h2, h3) -> true/false.
--   3. If true, client triggers Supabase password reset email (auth.resetPasswordForEmail).
--
-- Answers are verify-only: hashes never leave the server except as boolean result.
-- Rate limiting: callers should throttle; a future migration can add attempt tracking.

-- Get the 3 security question texts for an account (no hashes exposed).
create or replace function public.get_recovery_questions(p_email text)
returns table (q1 text, q2 text, q3 text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Find user by email (case-insensitive)
  select id into v_user_id from auth.users where lower(email) = lower(p_email) limit 1;
  if v_user_id is null then
    -- Return empty (don't reveal whether the email exists)
    return;
  end if;

  return query
    select sq.q1_text, sq.q2_text, sq.q3_text
    from public.grid_security_questions sq
    where sq.user_id = v_user_id;
end;
$$;

-- Verify the 3 hashed answers. Returns true only if ALL match.
create or replace function public.verify_recovery_answers(p_email text, p_h1 text, p_h2 text, p_h3 text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_match boolean;
begin
  select id into v_user_id from auth.users where lower(email) = lower(p_email) limit 1;
  if v_user_id is null then
    return false;
  end if;

  select (sq.q1_hash = p_h1 and sq.q2_hash = p_h2 and sq.q3_hash = p_h3)
    into v_match
    from public.grid_security_questions sq
    where sq.user_id = v_user_id;

  return coalesce(v_match, false);
end;
$$;

-- Allow anon + authenticated to call (recovery happens before login).
grant execute on function public.get_recovery_questions(text) to anon, authenticated;
grant execute on function public.verify_recovery_answers(text, text, text, text) to anon, authenticated;
