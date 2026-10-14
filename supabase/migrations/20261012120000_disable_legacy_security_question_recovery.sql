-- Disable legacy security-question recovery RPCs.
-- The browser must not be able to enumerate question prompts or submit answer
-- hashes to a public verification oracle. Recovery is handled by Supabase Auth's
-- email reset flow instead.
--
-- The functions may be absent in environments where the legacy flow was never
-- installed (the connected project catalog currently has neither signature).
-- Guard each revoke so this hardening migration is safe on both histories.
DO $migration$
BEGIN
  IF to_regprocedure('public.get_recovery_questions(text)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_recovery_questions(text) FROM PUBLIC, anon, authenticated';
  END IF;

  IF to_regprocedure('public.verify_recovery_answers(text, text, text, text)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.verify_recovery_answers(text, text, text, text) FROM PUBLIC, anon, authenticated';
  END IF;
END
$migration$;
