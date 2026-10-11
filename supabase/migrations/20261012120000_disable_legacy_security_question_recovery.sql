-- Disable legacy security-question recovery RPCs.
-- The browser must not be able to enumerate question prompts or submit answer
-- hashes to a public verification oracle. Recovery is handled by Supabase Auth's
-- email reset flow instead.
REVOKE EXECUTE ON FUNCTION public.get_recovery_questions(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_recovery_answers(text, text, text, text) FROM PUBLIC, anon, authenticated;
