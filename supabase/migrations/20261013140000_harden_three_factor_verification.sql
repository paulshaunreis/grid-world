-- Harden Grid World three-factor verification.
-- This migration is intentionally additive and is not applied to the live project
-- by this PR. Apply/test only through the normal reviewed migration workflow.

create table if not exists public.grid_verification_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.grid_verification_attempts enable row level security;
revoke all privileges on table public.grid_verification_attempts from public, anon, authenticated;

-- Enrolment is one-time. Replacing existing factors requires a separate,
-- authenticated change/recovery flow; simply calling this RPC must not reset them.
create or replace function public.grid_enroll_verification(p_codeword text, p_recovery_phrase text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, auth, extensions
as $function$
declare
  v_user_id uuid := auth.uid();
  v_email_verified boolean;
  v_auth_time bigint;
  v_recent_otp boolean := false;
  v_amr_entry jsonb;
  v_amr_timestamp bigint;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;

  v_auth_time := nullif(auth.jwt() ->> 'auth_time', '')::bigint;
  if v_auth_time is null
     or to_timestamp(v_auth_time::double precision) < clock_timestamp() - interval '5 minutes'
     or to_timestamp(v_auth_time::double precision) > clock_timestamp() + interval '30 seconds' then
    raise exception 'fresh_email_verification_required';
  end if;

  -- auth_time alone also changes after password sign-in. Require a recent OTP
  -- method in the signed Supabase AMR claim before treating this as step-up auth.
  for v_amr_entry in
    select value from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb))
  loop
    if jsonb_typeof(v_amr_entry) = 'object' and v_amr_entry ->> 'method' = 'otp' then
      begin
        v_amr_timestamp := nullif(v_amr_entry ->> 'timestamp', '')::bigint;
      exception when invalid_text_representation then
        v_amr_timestamp := null;
      end;
      if v_amr_timestamp is not null
         and to_timestamp(v_amr_timestamp::double precision) >= clock_timestamp() - interval '5 minutes'
         and to_timestamp(v_amr_timestamp::double precision) <= clock_timestamp() + interval '30 seconds' then
        v_recent_otp := true;
        exit;
      end if;
    end if;
  end loop;

  if not v_recent_otp then
    raise exception 'fresh_otp_authentication_required';
  end if;

  if p_codeword is null or p_recovery_phrase is null
     or length(trim(p_codeword)) < 8
     or length(trim(p_recovery_phrase)) < 12
     or octet_length(trim(p_codeword)) > 72
     or octet_length(trim(p_recovery_phrase)) > 72 then
    raise exception 'verification_secrets_invalid_length';
  end if;

  select email_confirmed_at is not null
    into v_email_verified
    from auth.users
    where id = v_user_id;

  if not coalesce(v_email_verified, false) then
    raise exception 'email_not_verified';
  end if;

  insert into public.grid_verification_factors(
    user_id, factor_one_label, factor_one_hash,
    factor_two_label, factor_two_hash,
    factor_three_label, factor_three_type, enrolled_at, updated_at
  )
  values (
    v_user_id,
    'GRID CODEWORD',
    extensions.crypt(trim(lower(p_codeword)), extensions.gen_salt('bf', 12)),
    'GRID RECOVERY PHRASE',
    extensions.crypt(trim(lower(p_recovery_phrase)), extensions.gen_salt('bf', 12)),
    'VERIFIED EMAIL',
    'email',
    now(),
    now()
  )
  on conflict (user_id) do nothing;

  if not found then
    raise exception 'verification_already_enrolled';
  end if;

  return jsonb_build_object('ok', true, 'factors', jsonb_build_array('email', 'codeword', 'recovery_phrase'));
end
$function$;

-- Rate limiting is stored server-side, not in browser state. Five incorrect
-- attempts in a 15-minute window trigger a 15-minute cooldown. Responses disclose
-- only the overall result, never which individual factor matched.
create or replace function public.grid_verify_three_factors(p_codeword text, p_recovery_phrase text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, auth, extensions
as $function$
declare
  v_user_id uuid := auth.uid();
  v_email_verified boolean := false;
  v_auth_time bigint;
  v_recent_otp boolean := false;
  v_amr_entry jsonb;
  v_amr_timestamp bigint;
  v_codeword_match boolean := false;
  v_recovery_match boolean := false;
  v_attempts integer := 0;
  v_window_started_at timestamptz;
  v_locked_until timestamptz;
begin
  if v_user_id is null then
    return jsonb_build_object('verified', false);
  end if;

  v_auth_time := nullif(auth.jwt() ->> 'auth_time', '')::bigint;
  if v_auth_time is null
     or to_timestamp(v_auth_time::double precision) < clock_timestamp() - interval '5 minutes'
     or to_timestamp(v_auth_time::double precision) > clock_timestamp() + interval '30 seconds' then
    return jsonb_build_object('verified', false);
  end if;

  -- Do not accept a recent password sign-in as proof of a fresh OTP challenge.
  for v_amr_entry in
    select value from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb))
  loop
    if jsonb_typeof(v_amr_entry) = 'object' and v_amr_entry ->> 'method' = 'otp' then
      begin
        v_amr_timestamp := nullif(v_amr_entry ->> 'timestamp', '')::bigint;
      exception when invalid_text_representation then
        v_amr_timestamp := null;
      end;
      if v_amr_timestamp is not null
         and to_timestamp(v_amr_timestamp::double precision) >= clock_timestamp() - interval '5 minutes'
         and to_timestamp(v_amr_timestamp::double precision) <= clock_timestamp() + interval '30 seconds' then
        v_recent_otp := true;
        exit;
      end if;
    end if;
  end loop;

  if not v_recent_otp then
    return jsonb_build_object('verified', false);
  end if;

  select email_confirmed_at is not null
    into v_email_verified
    from auth.users
    where id = v_user_id;

  if not coalesce(v_email_verified, false) then
    return jsonb_build_object('verified', false);
  end if;

  insert into public.grid_verification_attempts(user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  select attempts, window_started_at, locked_until
    into v_attempts, v_window_started_at, v_locked_until
    from public.grid_verification_attempts
    where user_id = v_user_id
    for update;

  if v_locked_until is not null and v_locked_until > clock_timestamp() then
    return jsonb_build_object('verified', false);
  end if;

  if v_window_started_at < clock_timestamp() - interval '15 minutes' then
    v_attempts := 0;
    v_window_started_at := clock_timestamp();
    update public.grid_verification_attempts
      set attempts = 0, window_started_at = v_window_started_at,
          locked_until = null, updated_at = clock_timestamp()
      where user_id = v_user_id;
  end if;

  select
    coalesce(f.factor_one_hash = extensions.crypt(trim(lower(coalesce(p_codeword, ''))), f.factor_one_hash), false),
    coalesce(f.factor_two_hash = extensions.crypt(trim(lower(coalesce(p_recovery_phrase, ''))), f.factor_two_hash), false)
    into v_codeword_match, v_recovery_match
    from public.grid_verification_factors f
    where f.user_id = v_user_id;

  if coalesce(v_codeword_match, false) and coalesce(v_recovery_match, false) then
    update public.grid_verification_attempts
      set attempts = 0, window_started_at = clock_timestamp(),
          locked_until = null, updated_at = clock_timestamp()
      where user_id = v_user_id;
    return jsonb_build_object('verified', true);
  end if;

  v_attempts := v_attempts + 1;
  update public.grid_verification_attempts
    set attempts = v_attempts,
        window_started_at = v_window_started_at,
        locked_until = case when v_attempts >= 5
          then clock_timestamp() + interval '15 minutes'
          else null
        end,
        updated_at = clock_timestamp()
    where user_id = v_user_id;

  return jsonb_build_object('verified', false);
end
$function$;

revoke all on function public.grid_enroll_verification(text, text) from public, anon;
revoke all on function public.grid_verify_three_factors(text, text) from public, anon;
grant execute on function public.grid_enroll_verification(text, text) to authenticated, service_role;
grant execute on function public.grid_verify_three_factors(text, text) to authenticated, service_role;
