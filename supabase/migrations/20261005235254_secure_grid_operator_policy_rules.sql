-- Operator policy rules are consumed by the grid-operator Edge Function using
-- the service role. Keep this table unavailable to browser roles by defining
-- no anon/authenticated RLS policies.
ALTER TABLE public.grid_operator_policy_rules ENABLE ROW LEVEL SECURITY;
