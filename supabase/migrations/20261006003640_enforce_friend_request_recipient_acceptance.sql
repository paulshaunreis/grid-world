-- Friend state changes must go through the authorization-checking RPCs. Direct
-- table writes allowed a caller to forge an accepted friendship row.
REVOKE INSERT, UPDATE, DELETE ON public.grid_social_friendships FROM anon, authenticated;
DROP POLICY IF EXISTS "friends self update" ON public.grid_social_friendships;
DROP POLICY IF EXISTS "friends self write" ON public.grid_social_friendships;

CREATE OR REPLACE FUNCTION public.grid_social_friend_respond(p_friend_user_id uuid, p_status text)
RETURNS public.grid_social_friendships
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  r public.grid_social_friendships;
  caller uuid := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF p_status IS NULL OR p_status NOT IN ('accepted','blocked') THEN RAISE EXCEPTION 'invalid friendship status'; END IF;

  IF p_status = 'accepted' THEN
    UPDATE public.grid_social_friendships
    SET status='accepted', updated_at=now()
    WHERE ((user_id=caller AND friend_user_id=p_friend_user_id)
        OR (user_id=p_friend_user_id AND friend_user_id=caller))
      AND requested_by IS DISTINCT FROM caller
      AND status='pending'
    RETURNING * INTO r;
  ELSE
    UPDATE public.grid_social_friendships
    SET status='blocked', updated_at=now()
    WHERE ((user_id=caller AND friend_user_id=p_friend_user_id)
        OR (user_id=p_friend_user_id AND friend_user_id=caller))
    RETURNING * INTO r;
  END IF;

  IF r.user_id IS NULL THEN RAISE EXCEPTION 'friend request unavailable'; END IF;
  RETURN r;
END;
$function$;
