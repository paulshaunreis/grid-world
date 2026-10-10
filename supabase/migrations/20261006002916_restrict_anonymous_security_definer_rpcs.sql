-- These account-scoped RPCs are only meaningful for authenticated users.
-- Remove both direct anon grants and any inherited PUBLIC execution.
REVOKE ALL ON FUNCTION public.grid_age_band_allowed(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grid_enroll_verification(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grid_profile_upsert(text, text, text, text, text, text, jsonb, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grid_profile_upsert(text, text, text, text, text, text, jsonb, jsonb, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grid_set_presence(boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grid_verify_three_factors(text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.grid_age_band_allowed(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grid_enroll_verification(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grid_profile_upsert(text, text, text, text, text, text, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grid_profile_upsert(text, text, text, text, text, text, jsonb, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grid_set_presence(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grid_verify_three_factors(text, text) TO authenticated;
