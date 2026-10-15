## Security handoff — 2026-10-15

### Verified repository changes
- PR #137 latest head after the handoff/PR-description update: `52939cbbe91349e55a2c3f50659396375f369826`. The tested source/workflow commit is `814767af45de95bd202f4e188c6a5b160b1f4305`; subsequent commit only updates handoff/PR metadata.
- Extracted request parsing and moderation schema validation into `supabase/functions/grid-operator/request-guards.ts`, allowing tests without loading the live Edge Function or credentials.
- Added `supabase/functions/grid-operator/request-guards_test.ts` covering valid JSON objects, malformed JSON, non-object JSON, invalid UTF-8, oversized bodies without relying on Content-Length, allowed moderation values, and fail-closed fallback.
- Updated `.github/workflows/ci.yml` to install Deno and run those tests before the existing npm/TypeScript/build checks.
- GitHub Actions run [#1578](https://github.com/paulshaunreis/grid-world/actions/runs/38658100963) completed successfully on tested commit `814767af45de95bd202f4e188c6a5b160b1f4305`. The Deno guard tests, npm install, TypeScript check, and build all passed. The later handoff/PR-description commit does not change code or workflow.

### Remaining gates
- Tests cover the extracted guard helpers, not the complete deployed Supabase Edge Function runtime or live AI gateway behavior.
- Confirm `grid_operator_cases.severity` database constraints match the accepted moderation severities.
- Design durable shared-state rate limiting before broad anonymous AI access; no in-memory-only counter.
- Decide whether guest chat and moderation are permitted.
- Review wildcard CORS against a documented client-access inventory.
- Add integration tests for sanitized internal failures and persistence behavior without using production writes.

### Safety status
- PR remains draft/open/unmerged. No deployment or production database changes were performed.
- Do not promote the change as production-ready until CI succeeds and the remaining gates are addressed.


### Follow-up audit — 2026-10-15
- Read the current `main` branch recursive tree and all tracked migration paths. The tracked migrations include no creation/constraint migration for `grid_operator_cases` or `grid_operator_policy_rules`; repository code references these tables, but this audit cannot establish their authoritative schema. GitHub code search for the table names also returned no matches. This is a repository-evidence gap, not proof that the tables do not exist in a live project.
- The only tracked migration whose name references an operator-adjacent system is `20261008020000_integrate_grid_conversation_audit.sql`; it concerns conversation functions and does not define operator-case severity.
- Therefore the current moderation allowlist (`info`, `notice`, `warning`, `critical`) is validated by unit tests only, not against the live database constraint. Do not broaden or change values until schema provenance is found.
- Code-path review confirmed `chat` and `moderate` do not require an authenticated user; unauthenticated moderation uses an empty policy-rules list, and AI gateway calls have no durable shared quota in this function. This supports treating anonymous gateway access as a release gate, not as a confirmed abuse incident.
- No durable rate-limit table/RPC was found in the tracked migration filenames. Do not implement a guessed migration while the table/schema provenance gap remains unresolved.
- Safe next steps: obtain authoritative schema/migration provenance for the operator tables; select guest-access policy; then implement/test durable shared rate limiting and run full integration tests in a disposable Supabase environment. Wildcard CORS still needs a supported-client inventory before a safe restriction can be chosen.
