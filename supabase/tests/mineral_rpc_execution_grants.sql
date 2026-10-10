-- Regression assertions for mineral RPC execution grants.
-- Run after migrations against a non-production database. A missing function is
-- allowed here because legacy function definitions are not yet source-controlled.
DO $test$
DECLARE
  fn regprocedure;
BEGIN
  fn := to_regprocedure('public.grid_seed_world_minerals(text)');
  IF fn IS NOT NULL THEN
    IF has_function_privilege('anon', fn, 'EXECUTE')
       OR has_function_privilege('authenticated', fn, 'EXECUTE') THEN
      RAISE EXCEPTION 'Browser role can execute grid_seed_world_minerals';
    END IF;
    IF NOT has_function_privilege('service_role', fn, 'EXECUTE') THEN
      RAISE EXCEPTION 'service_role lost execute permission on grid_seed_world_minerals';
    END IF;
  END IF;

  fn := to_regprocedure('public.grid_mine_mineral(text,integer)');
  IF fn IS NOT NULL THEN
    IF has_function_privilege('anon', fn, 'EXECUTE')
       OR has_function_privilege('authenticated', fn, 'EXECUTE') THEN
      RAISE EXCEPTION 'Browser role can execute grid_mine_mineral';
    END IF;
    IF NOT has_function_privilege('service_role', fn, 'EXECUTE') THEN
      RAISE EXCEPTION 'service_role lost execute permission on grid_mine_mineral';
    END IF;
  END IF;
END
$test$;
