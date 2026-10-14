## Security handoff — 2026-10-14

### Verified
- PR #137 current head: `76ca36d905b898cd229f01c4b7fbb3212f021a12`.
- GitHub Actions run [#1572](https://github.com/paulshaunreis/grid-world/actions/runs/38647051067) passed on that exact head: dependency install, TypeScript check, and production build.
- Changes include a 16 KiB streaming request-body cap (cancel on overflow), bounded allowlisted runtime context, strict moderation result shape checks with REVIEW fallback, and generic public error responses.
- PR remains draft/open/unmerged. No deployment or production database change was performed.

### Still unverified / release blockers
- CI is the main web-app workflow and does not prove Supabase Edge Function runtime behavior.
- No dedicated tests yet for malformed/oversized requests, moderation schema edge cases, or error sanitization.
- No durable rate limiting/quota strategy yet. Do not treat per-isolate in-memory counters as sufficient because serverless instances can scale/restart.
- Guest chat/moderation policy is unresolved.
- Moderation enum/severity values still need checking against actual persistence constraints.
- Wildcard CORS remains unchanged pending an explicit client-access inventory.

### Next safe actions
1. Inspect the exact PR diff and function control flow for accidental source-format damage and behavior regressions.
2. Add an Edge Function-specific typecheck/test path compatible with the repository's supported runtime.
3. Decide whether guest AI calls are permitted; design a durable shared quota/throttle before implementing it.
4. Test request-size and invalid-payload behavior, moderation fallback, and generic errors.
5. Keep PR #137 draft until those gates are satisfied.
6. Resume PR #130 migration-history reconciliation and PR #133 reset-email roundtrip testing; do not change production schema to compensate for missing history without a reproducible plan.

This note records evidence and next steps; it does not claim production readiness.