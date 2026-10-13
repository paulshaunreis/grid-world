-- Verification-factor hashes are authentication secrets and must never be directly
-- readable or mutable by browser roles. RLS alone does not protect TRUNCATE and
-- row policies do not replace least-privilege table grants.
-- SECURITY DEFINER routines owned by the trusted database role can continue to
-- perform their narrowly scoped work; service_role retains server-side access.
-- Revoke PUBLIC too so no inherited grant can survive for browser roles.
REVOKE ALL PRIVILEGES ON TABLE public.grid_verification_factors FROM public, anon, authenticated;
