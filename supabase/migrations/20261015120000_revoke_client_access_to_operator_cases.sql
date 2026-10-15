-- Keep operator case records server-side. Browser clients must not have
-- direct table privileges; the Edge Function uses the service-role client.
-- RLS remains enabled as defense in depth for any future grants.
REVOKE ALL PRIVILEGES ON TABLE public.grid_operator_cases FROM PUBLIC, anon, authenticated;
