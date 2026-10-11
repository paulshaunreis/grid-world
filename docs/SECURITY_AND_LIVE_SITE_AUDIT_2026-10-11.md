# Grid World — Security and Live-Site Audit Checklist

**Started:** 2026-10-11  
**Status:** Audit plan and known-risk baseline; live verification incomplete  
**Rule:** Never infer live behavior from source or a successful build. Record source audit, CI, database inspection, browser verification, and deployment status separately.

## 1. Known security baseline from the engineering handoff

- [x] Legacy mining RPCs are revoked from PUBLIC, anon, and authenticated; service_role is the only granted role.
- [x] Combat-state browser writes were revoked; authenticated has SELECT-only access to `public.grid_combat_state`; service_role retains writes.
- [x] `grid-combat` Edge Function version 21 was recorded as deployed with JWT verification enabled; the five-second stale-sync movement bypass was removed.
- [ ] Trusted server-owned world/session identity and validated teleport/world transitions.
- [ ] Server-side movement plausibility, range/cooldown/replay protection, and atomic inventory credit for mining.
- [ ] Authenticated end-to-end mining regression tests. Keep browser mining disabled until the full gate passes.
- [ ] Fresh review of current live Supabase grants, RLS policies, function grants, migration history, and Edge Function source. The items marked above as previously verified must be rechecked before treating them as current.

## 2. Current source/repository findings (2026-10-11)

- [x] Re-fetched the open PR list. PR #126 (profiles), #127 (forum foundation), and #128 (audit checklist) remain open and unmerged. Several older security/governance PRs are also still open; review their age, conflicts, and relevance before assuming they are already in main.
- [x] PR #128 CI: GitHub Actions run #1502 completed successfully. This verifies the documentation branch's configured CI, not live security or browser behavior.
- [x] Render deployment list reports the current live deployment as commit `770d958e5e5977d992bd619b2670b82c719fa90a` (PR #125 merge), status `live`. This does not establish that every route or control works.
- [x] The current `src/social/messageBoard.ts` stores posts and replies in browser `localStorage`; the Supabase mirror is explicitly a future phase. This is a confirmed source-level limitation: posts do not synchronize between users/devices, and client-supplied author handles are not server-authoritative identity.
- [x] Repository migrations include `20261008000000_create_grid_audit_events.sql`. Therefore, an audit-events migration exists; coverage, RLS, write paths, and completeness of actual security-event logging still require review.
- [ ] Inspect account/authentication, profile privacy, social reads/writes, Marketplace/economy mutations, world entry and combat actions for server-side authorization.
- [ ] Check for exposed service-role credentials, unsafe RPC grants, user-controlled authoritative state, missing input bounds, replay/double-submit risk, and silent failures.
- [ ] Re-check migrations against live migration history; never apply an unreviewed migration as part of this audit.
- [ ] Inspect audit-event schema, RLS, trusted writers, and whether high-risk admin/moderator/economy/security actions actually produce traceable records.

## 3. Live site and browser smoke test

Target: https://grid-world-qghn.onrender.com

- [ ] Confirm the homepage returns successfully and identify the deployed commit/build.
- [ ] Check primary navigation and every linked page for 404s, blank screens, missing assets, console errors, and dead-end controls.
- [ ] Test sign-in/sign-out and account failure states without exposing credentials or private data.
- [ ] Check profile, directory, forum, settings, Marketplace/economy, and world-entry pages on desktop and narrow/mobile viewports.
- [ ] In the world, verify WASD direction, jump, camera pan/orbit/zoom, teleport flow, HUD layering, and that avatar audio remains muted per current temporary UX direction.
- [ ] Capture evidence per issue and separate reproducible defects from unverified assumptions.

**Environment limitation:** the web inspection tool could not load the Render URL, and a direct HTTP attempt from this runtime failed at DNS resolution. Neither result proves the site is down; interactive browser verification remains blocked in this environment.

## 4. Severity and release gates

- **P0:** active credential exposure, authorization bypass, user data exposure, or exploitable economy mutation. Contain first; do not add features until resolved.
- **P1:** account/profile privacy failure, broken core navigation, destructive data loss, or production-only failures.
- **P2:** core UI defects, missing assets, responsive problems, or inaccessible interactions.
- **P3:** polish and non-blocking enhancements.

## 5. Reporting format

For each finding record: severity, route/system, exact reproduction, expected vs actual behavior, evidence, security/data impact, smallest safe fix, tests required, and whether the finding was verified in source, CI, live database, browser, or deployment.

Do not call a finding fixed until the matching verification step passes. Do not claim the site is fully audited until every relevant checklist item is either verified or explicitly marked blocked/not applicable.


## 6. Live Supabase inspection (2026-10-11)

- [x] Connected to the configured `grid-world` Supabase project and checked its project status: `ACTIVE_HEALTHY`.
- [x] Compared live migration history with repository migration names. Live history includes the recent hardening entries for anonymous SECURITY DEFINER RPC restrictions, forum content-rating RLS, direct resource-sale execution revocation, team-post RPC restrictions, mineral RPC restrictions pending authoritative presence, and combat-state client-write revocation. This is migration-history evidence, not proof that every policy behaves correctly.
- [x] Queried the live Security Advisor. It reports **4 tables with RLS enabled and no policies**: `grid_economy_monetary_policy`, `grid_name_reservations`, `grid_omni_bank_reserves`, and `grid_operator_policy_rules`. This may be an intentional fail-closed design, but each table's grants, intended access, and server-only usage must be confirmed before adding any policies.
- [x] Security Advisor also reports **51 SECURITY DEFINER functions executable by authenticated users**. This is a review queue, not a conclusion that all 51 are vulnerable: some may intentionally serve signed-in users. Prioritize economy/barter/marketplace/build functions and verify each function's caller authorization, fixed/empty `search_path`, schema qualification, argument validation, and least-privilege EXECUTE grants.
- [x] Performance Advisor reports **51 foreign keys without covering indexes**. This is a performance follow-up, not a security exploit. Rank by high-traffic query paths and table size before proposing indexes.
- [ ] Review the complete advisor output, including any additional security lint categories beyond the findings summarized above; inspect function definitions/grants and table grants/policies before proposing changes.
- [ ] Run targeted, read-only SQL to enumerate the four no-policy tables' grants, all exposed SECURITY DEFINER function signatures and grants, and each function's `proconfig`/search_path. Do not change production grants or policies until the intended public/authenticated/service-only contract is established.

**Advisor interpretation:** Supabase's guidance distinguishes table grants from RLS policies, and warns that exposed SECURITY DEFINER functions run with their owner's privileges. The appropriate response is to inspect intended access and the function body/grants—not to blanket-revoke all functions or create blanket policies.
