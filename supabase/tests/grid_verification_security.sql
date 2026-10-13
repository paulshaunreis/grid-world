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
     or has_table_privilege('authenticated', 'public.grid_verification_factors', 'TRUNCATE') then
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
     or has_table_privilege('authenticated', 'public.grid_verification_attempts', 'TRUNCATE') then
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

  if position('locked_until' in verify_def) = 0
     or position('interval ''15 minutes''' in verify_def) = 0 then
    raise exception 'Verification RPC does not implement persistent cooldown logic';
  end if;

  if not ('search_path=pg_catalog, auth, extensions' = any(coalesce(verify_config, array[]::text[])))
     or not ('search_path=pg_catalog, auth, extensions' = any(coalesce(enroll_config, array[]::text[]))) then
    raise exception 'SECURITY DEFINER RPCs do not use the expected restricted search_path';
  end if;

  if position('extensions.digest' in verify_def) = 0
     or position('extensions.digest' in enroll_def) = 0 then
    raise exception 'Verification RPCs must resolve pgcrypto digest explicitly';
  end if;
end
$test$;
