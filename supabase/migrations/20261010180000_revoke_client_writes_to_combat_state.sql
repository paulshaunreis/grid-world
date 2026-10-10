-- Combat state is authoritative server-owned state. Browser roles must not
-- be able to insert or mutate positions/health/mode directly; all writes flow
-- through the authenticated grid-combat Edge Function using service_role.
-- Keep owner-scoped reads for the current HUD.
REVOKE ALL ON TABLE public.grid_combat_state FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.grid_combat_state TO authenticated;

DROP POLICY IF EXISTS combat_state_owner_insert ON public.grid_combat_state;
DROP POLICY IF EXISTS combat_state_owner_update ON public.grid_combat_state;

-- Defense in depth: no browser-role policy should authorize combat-state writes.
