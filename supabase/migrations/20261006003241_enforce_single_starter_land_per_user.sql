-- Both starter-land RPCs perform a read-then-claim check. Enforce the invariant
-- in the database so concurrent requests cannot claim multiple starter parcels.
CREATE UNIQUE INDEX grid_land_parcels_one_starter_per_user_idx
ON public.grid_land_parcels (owner_user_id)
WHERE acquisition = 'starter' AND owner_user_id IS NOT NULL;
