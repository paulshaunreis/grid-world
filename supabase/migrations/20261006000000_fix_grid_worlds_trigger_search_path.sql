-- Pin this trigger function to trusted built-ins and avoid resolving names from
-- caller-controlled schemas when PostgreSQL executes it.
ALTER FUNCTION public.grid_worlds_touch_updated_at() SET search_path = pg_catalog;
