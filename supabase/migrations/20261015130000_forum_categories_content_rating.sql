-- Forum drift-capture migration (2026-10-15).
--
-- Verified live 2026-10-15 (read-only inspection): the RLS policies on
-- grid_forum_categories / grid_forum_topics / grid_forum_posts reference
-- content_rating on grid_forum_categories (e.g. age_band_read, topics_*
-- and posts_* policies join categories and check c.content_rating), but
-- the column did not exist on grid_forum_categories — so every
-- category/topic/post read failed with "column c.content_rating does not
-- exist". This migration adds the column (default 'E', matching the
-- anon public_safe_read policies that only expose E-rated rows).
--
-- RECORD OF A LIVE APPLY: these statements were already applied live via
-- the Supabase Dashboard SQL Editor on 2026-10-15 (with verification
-- queries). Do NOT re-apply blindly — on a fresh repo-migrated DB the
-- ADD COLUMN is a no-op where the column already exists and the REVOKEs
-- are idempotent, but the live database already has this state.
--
-- The four REVOKEs remove TRUNCATE / TRIGGER / REFERENCES from anon +
-- authenticated on the forum tables (RLS does not cover TRUNCATE), same
-- hardening applied to the account tables in the Phase 1 migration.

alter table public.grid_forum_categories
  add column if not exists content_rating text not null default 'E';

revoke truncate, trigger, references on public.grid_forum_categories from anon, authenticated;
revoke truncate, trigger, references on public.grid_forum_topics from anon, authenticated;
revoke truncate, trigger, references on public.grid_forum_posts from anon, authenticated;
revoke truncate, trigger, references on public.grid_forum_likes from anon, authenticated;
