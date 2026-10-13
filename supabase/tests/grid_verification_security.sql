-- Regression checks for three-factor verification hardening.
-- Run against a disposable/test database after applying migrations in order.
do $test$
declare
  enroll_fn regprocedure := to_regprocedure('public.grid_enroll_verification(text,text)');
  verify_fn regprocedure := to_regprocedure('public.grid_verify_three_factors(text,text)');
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

  if position('codeword_verified' in pg_get_functiondef(verify_fn)) > 0
     or position('recovery_verified' in pg_get_functiondef(verify_fn)) > 0 then
    raise exception 'Verification RPC still exposes per-factor result booleans';
  end if;

  if position('verification_already_enrolled' in pg_get_functiondef(enroll_fn)) = 0 then
    raise exception 'Enrollment RPC does not reject factor replacement';
  end if;

  if position('locked_until' in pg_get_functiondef(verify_fn)) = 0
     or position('interval ''15 minutes''' in pg_get_functiondef(verify_fn)) = 0 then
    raise exception 'Verification RPC does not implement persistent cooldown logic';
  end if;
end
$test$;
