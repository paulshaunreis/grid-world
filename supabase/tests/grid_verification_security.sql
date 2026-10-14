-- Regression checks for three-factor verification hardening.
-- Run against a disposable/test database after applying migrations in order.
do $test$
declare
  enroll_fn regprocedure := to_regprocedure('public.grid_enroll_verification(text,text)');
  verify_fn regprocedure := to_regprocedure('public.grid_verify_three_factors(text,text)');
  verify_def text;
  enroll_def text;
  verify_config text[];
  enroll_config text[];
begin
  if enroll_fn is null or verify_fn is null then
    raise exception 'Expected three-factor verification RPCs to exist';
  end if;

  if has_table_privilege('anon', 'public.grid_verification_factors', 'SELECT')
     or has_table_privilege('anon', 'public.grid_verification_factors', 'INSERT')
     or has_table_privilege('anon', 'public.grid_verification_factors', 'UPDATE')
     or has_table_privilege('anon', 'public.grid_verification_factors', 'DELETE')
     or has_table_privilege('anon', 'public.grid_verification_factors', 'TRUNCATE')
     or has_table_privilege('authenticated', 'public.grid_verification_factors', 'SELECT')
     or has_table_privilege('authenticated', 'public.grid_verification_factors', 'INSERT')
     or has_table_privilege('authenticated', 'public.grid_verification_factors', 'UPDATE')
     or has_table_privilege('authenticated', 'public.grid_verification_factors', 'DELETE')
     or has_table_privilege('authenticated', 'public.grid_verification_factors', 'TRUNCATE')
     or has_table_privilege('anon', 'public.grid_verification_factors', 'REFERENCES')
     or has_table_privilege('anon', 'public.grid_verification_factors', 'TRIGGER')
     or has_table_privilege('authenticated', 'public.grid_verification_factors', 'REFERENCES')
     or has_table_privilege('authenticated', 'public.grid_verification_factors', 'TRIGGER') then
    raise exception 'Browser roles retain direct privileges on verification factors';
  end if;

  if has_table_privilege('anon', 'public.grid_verification_attempts', 'SELECT')
     or has_table_privilege('anon', 'public.grid_verification_attempts', 'INSERT')
     or has_table_privilege('anon', 'public.grid_verification_attempts', 'UPDATE')
     or has_table_privilege('anon', 'public.grid_verification_attempts', 'DELETE')
     or has_table_privilege('anon', 'public.grid_verification_attempts', 'TRUNCATE')
     or has_table_privilege('authenticated', 'public.grid_verification_attempts', 'SELECT')
     or has_table_privilege('authenticated', 'public.grid_verification_attempts', 'INSERT')
     or has_table_privilege('authenticated', 'public.grid_verification_attempts', 'UPDATE')
     or has_table_privilege('authenticated', 'public.grid_verification_attempts', 'DELETE')
     or has_table_privilege('authenticated', 'public.grid_verification_attempts', 'TRUNCATE')
     or has_table_privilege('anon', 'public.grid_verification_attempts', 'REFERENCES')
     or has_table_privilege('anon', 'public.grid_verification_attempts', 'TRIGGER')
     or has_table_privilege('authenticated', 'public.grid_verification_attempts', 'REFERENCES')
     or has_table_privilege('authenticated', 'public.grid_verification_attempts', 'TRIGGER') then
    raise exception 'Browser roles retain direct privileges on verification attempt records';
  end if;

  if has_function_privilege('anon', enroll_fn, 'EXECUTE')
     or has_function_privilege('anon', verify_fn, 'EXECUTE') then
    raise exception 'Anonymous role can execute verification RPCs';
  end if;

  if not has_function_privilege('authenticated', enroll_fn, 'EXECUTE')
     or not has_function_privilege('authenticated', verify_fn, 'EXECUTE') then
    raise exception 'Authenticated role lost intended verification RPC execution';
  end if;

  verify_def := pg_get_functiondef(verify_fn);
  enroll_def := pg_get_functiondef(enroll_fn);
  select proconfig into verify_config from pg_proc where oid = verify_fn;
  select proconfig into enroll_config from pg_proc where oid = enroll_fn;

  if position('codeword_verified' in verify_def) > 0
     or position('recovery_verified' in verify_def) > 0 then
    raise exception 'Verification RPC still exposes per-factor result booleans';
  end if;

  if position('verification_already_enrolled' in enroll_def) = 0 then
    raise exception 'Enrollment RPC does not reject factor replacement';
  end if;

  if position('p_codeword is null' in enroll_def) = 0
     or position('p_recovery_phrase is null' in enroll_def) = 0
     or position('octet_length(trim(p_codeword)) > 72' in enroll_def) = 0
     or position('octet_length(trim(p_recovery_phrase)) > 72' in enroll_def) = 0 then
    raise exception 'Enrollment RPC must reject null secrets and enforce bcrypt 72-byte input limits';
  end if;

  if position('locked_until' in verify_def) = 0
     or position('interval ''15 minutes''' in verify_def) = 0 then
    raise exception 'Verification RPC does not implement persistent cooldown logic';
  end if;

  if not ('search_path=pg_catalog, auth, extensions' = any(coalesce(verify_config, array[]::text[])))
     or not ('search_path=pg_catalog, auth, extensions' = any(coalesce(enroll_config, array[]::text[]))) then
    raise exception 'SECURITY DEFINER RPCs do not use the expected restricted search_path';
  end if;

  if position('extensions.crypt' in verify_def) = 0
     or position('extensions.crypt' in enroll_def) = 0
     or position('extensions.gen_salt(''bf'', 12)' in enroll_def) = 0 then
    raise exception 'Verification secrets must use salted bcrypt hashes and constant-format bcrypt verification';
  end if;

  if position('extensions.digest' in verify_def) > 0
     or position('extensions.digest' in enroll_def) > 0 then
    raise exception 'Verification RPCs must not use fast unsalted digest hashes for user-chosen secrets';
  end if;

  if position('auth_time' in verify_def) = 0
     or position('auth_time' in enroll_def) = 0
     or position('interval ''5 minutes''' in verify_def) = 0
     or position('interval ''5 minutes''' in enroll_def) = 0 then
    raise exception 'Enrollment and verification must require recent authentication time';
  end if;

  if position('auth.jwt() -> ''amr''' in verify_def) = 0
     or position('auth.jwt() -> ''amr''' in enroll_def) = 0
     or position('v_amr_entry ->> ''method'' = ''otp''' in verify_def) = 0
     or position('v_amr_entry ->> ''method'' = ''otp''' in enroll_def) = 0
     or position('v_amr_timestamp' in verify_def) = 0
     or position('v_amr_timestamp' in enroll_def) = 0 then
    raise exception 'Enrollment and verification must require a recent OTP AMR entry, not auth_time alone';
  end if;
end
$test$;
