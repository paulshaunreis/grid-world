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

## 2. Current-main application review

- [ ] Re-fetch current main and open PR list; check whether PR #126 (profiles) and PR #127 (forums) are still open, merged, or superseded.
- [ ] Inspect account/authentication, profile privacy, social reads/writes, Marketplace/economy mutations, world entry and combat actions for server-side authorization.
- [ ] Check for exposed service-role credentials, unsafe RPC grants, user-controlled authoritative state, missing input bounds, replay/double-submit risk, and silent failures.
- [ ] Re-check migrations against live migration history; never apply an unreviewed migration as part of this audit.
- [ ] Confirm security-sensitive admin/moderator actions have traceable audit records or document the gap.

## 3. Live site and browser smoke test

Target: https://grid-world-qghn.onrender.com

- [ ] Confirm the homepage returns successfully and identify the deployed commit/build.
- [ ] Check primary navigation and every linked page for 404s, blank screens, missing assets, console errors, and dead-end controls.
- [ ] Test sign-in/sign-out and account failure states without exposing credentials or private data.
- [ ] Check profile, directory, forum, settings, Marketplace/economy, and world-entry pages on desktop and narrow/mobile viewports.
- [ ] In the world, verify WASD direction, jump, camera pan/orbit/zoom, teleport flow, HUD layering, and that avatar audio remains muted per current temporary UX direction.
- [ ] Capture evidence per issue and separate reproducible defects from unverified assumptions.

**Environment limitation at audit start:** the web inspection tool could not load the Render URL. This is not proof that the site is down; browser-based verification remains required.

## 4. Severity and release gates

- **P0:** active credential exposure, authorization bypass, user data exposure, or exploitable economy mutation. Contain first; do not add features until resolved.
- **P1:** account/profile privacy failure, broken core navigation, destructive data loss, or production-only failures.
- **P2:** core UI defects, missing assets, responsive problems, or inaccessible interactions.
- **P3:** polish and non-blocking enhancements.

## 5. Reporting format

For each finding record: severity, route/system, exact reproduction, expected vs actual behavior, evidence, security/data impact, smallest safe fix, tests required, and whether the finding was verified in source, CI, live database, browser, or deployment.

Do not call a finding fixed until the matching verification step passes. Do not claim the site is fully audited until every relevant checklist item is either verified or explicitly marked blocked/not applicable.
