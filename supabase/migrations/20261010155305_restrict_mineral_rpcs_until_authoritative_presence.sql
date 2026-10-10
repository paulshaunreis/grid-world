-- Mineral RPCs currently lack server-authoritative world/position checks.
-- Fail closed until mining is routed through a trusted server-side interaction
-- flow. The application has no browser RPC caller for these legacy functions.
--
-- Conditional checks keep clean installs working: these legacy RPC definitions
-- exist in the live database but are not represented by a creation migration in
-- the repository. That source-of-truth gap is tracked separately.
DO $migration$
BEGIN
  IF to_regprocedure('public.grid_seed_world_minerals(text)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.grid_seed_world_minerals(text) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.grid_seed_world_minerals(text) TO service_role';
  END IF;

  IF to_regprocedure('public.grid_mine_mineral(text,integer)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.grid_mine_mineral(text, integer) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.grid_mine_mineral(text, integer) TO service_role';
  END IF;
END
$migration$;
