-- Restrict legacy team-post creation to trusted server-side callers.
-- The shipped website only reads grid_team_posts; no client write path or
-- database cron job uses this RPC. Caller-supplied author fields must not be
-- accepted from anon/authenticated clients because they can impersonate staff.
ALTER FUNCTION public.insert_team_post(text, text, text, text, text, text)
  SET search_path TO '';

REVOKE ALL ON FUNCTION public.insert_team_post(text, text, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_team_post(text, text, text, text, text, text)
  TO service_role;

-- Defense in depth: the friendship-response RPC already schema-qualifies its
-- table and auth references; pin its search path so SECURITY DEFINER execution
-- cannot resolve names through a writable schema.
ALTER FUNCTION public.grid_social_friend_respond(uuid, text)
  SET search_path TO '';
