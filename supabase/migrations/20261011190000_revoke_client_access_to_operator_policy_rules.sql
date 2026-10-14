-- Operator policy rules are internal governance configuration, not client-owned data.
-- RLS without policies blocks ordinary row access, but does not protect TRUNCATE.
-- Remove all direct table privileges from browser-facing roles; trusted server code
-- using service_role and database owners retain their required access.
REVOKE ALL PRIVILEGES ON TABLE public.grid_operator_policy_rules FROM PUBLIC, anon, authenticated;
