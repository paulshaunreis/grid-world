-- Grid World RLS smoke-test checklist
-- Run with Supabase's database test tooling against a non-production test environment.
-- These assertions are intentionally kept as a checklist until the project has a dedicated test role.

-- grid_texture_library:
-- anon SELECT: only moderation_state='approved' and rights_status <> 'blocked'
-- anon INSERT/UPDATE/DELETE: denied
-- authenticated INSERT: creator_id must equal auth.uid()
-- authenticated UPDATE: creator_id must remain auth.uid()
-- authenticated SELECT: public approved rows + own rows

-- Never use service_role/secret keys in browser tests.
