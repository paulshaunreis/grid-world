# Grid World Security Work Log — 2026-10-11

**Purpose:** Dated checkpoint for work completed or reviewed on October 11, 2026. Keep this file append-only by date where practical so a fresh assistant/engineer can resume without reconstructing the session.
**Repository:** `paulshaunreis/grid-world`
**Live site:** https://grid-world-qghn.onrender.com
**Rule:** Open/draft PRs are not merged or deployed. Do not merge or apply production migrations without Paul's explicit approval.

## 2026-10-11 — Account recovery hardening and cross-PR integration

### Password-reset flow — PR #133
- PR: https://github.com/paulshaunreis/grid-world/pull/133
- Branch: `security/complete-password-reset-flow-ci`
- Latest reviewed head: `9e0e1bd6d37b7d112300cd2ccb0d571796657acd`
- Status at checkpoint: open, draft, unmerged, not deployed; GitHub reports mergeable.
- CI: GitHub Actions run #1510 completed successfully for prior head `9e0e1bd6d37b7d112300cd2ccb0d571796657acd`. After that pass, I made a small follow-up commit `a943d3e5e61b4d2f0713f4a42227949d699315d9` to inspect Supabase SDK-returned errors. The follow-up commit's CI run was not yet visible at the time of this note. The earlier pass is not evidence that the newest commit passed.
- `src/recover.ts` now uses Supabase Auth `resetPasswordForEmail` rather than showing security questions or calling the legacy answer-verification RPCs. It gives the same public response regardless of whether an account exists.
- Reset email redirect is currently hard-coded to `https://grid-world-qghn.onrender.com/reset-password.html`.
- `reset-password.html` and `src/reset-password.ts` provide the completion page. Password fields remain disabled until Supabase emits a `PASSWORD_RECOVERY` event with a session. Passwords must match and be at least 12 characters; update uses `client.auth.updateUser`.
- The recovery request handler intentionally returns a generic user-facing message. Note: `resetPasswordForEmail` returns an object with an `error` field in common Supabase SDK usage; the current implementation only catches thrown exceptions and does not inspect the returned `error`. The user-facing response remains generic (good for account enumeration resistance), but internal handling/telemetry and user feedback behavior need review.
- The reset completion page currently uses a timeout to report invalid/expired links if no recovery event appears. Test actual email links in the configured Supabase project before release.
- Required before release: confirm Supabase Auth redirect allowlist, verify real email link round-trip and expired-link behavior, confirm the deployed site contains the expected entry pages, and test sign-in after password update. No production DB changes or deployment were made.

### Overlapping legacy-recovery PR — PR #131
- PR: https://github.com/paulshaunreis/grid-world/pull/131
- Branch: `security/disable-insecure-question-based-recovery`
- Head: `984cee5e574fd7ecb373b7de936eb9d97441e13a`
- Status: draft/open/unmerged/un-deployed; previously observed CI run #1508 passed.
- It also replaces `src/recover.ts` with an email reset flow and adds migration `supabase/migrations/20261012120000_disable_legacy_security_question_recovery.sql` to revoke execution of `public.get_recovery_questions(text)` and `public.verify_recovery_answers(text,text,text,text)` from `PUBLIC, anon, authenticated`.
- PR #133 and PR #131 overlap on the same recovery UI. Do not merge both blindly. Before approval, consolidate into one reviewable change or otherwise ensure the database revocation migration is retained in the selected release. The frontend replacement alone does not remove callable legacy database functions.
- Migration date in filename is 2026-10-12, which is later than this checkpoint date (2026-10-11); confirm whether the date is intentional before release.

### Related least-privilege reviews
- PR #130: https://github.com/paulshaunreis/grid-world/pull/130 — proposes revoking direct browser-role privileges on `public.grid_verification_factors`. Open draft, unmerged, un-deployed. Before approval, verify all legitimate enrollment/update paths use trusted server-side functions.
- PR #129: https://github.com/paulshaunreis/grid-world/pull/129 — proposes revoking direct browser-role privileges on `public.grid_operator_policy_rules`. Open draft, unmerged, un-deployed. Prior CI run #1505 was still in progress at last checkpoint; recheck its final status.
- PR #128: https://github.com/paulshaunreis/grid-world/pull/128 — security/live-site audit documentation. Open draft, unmerged; CI run #1506 previously passed.
- PR #132 was closed unmerged as a duplicate of #133.
- Do not assume any open PR has changed the live site.

### Security findings retained for follow-up
- Supabase Security Advisor previously listed four RLS-enabled tables without policies: `grid_economy_monetary_policy`, `grid_name_reservations`, `grid_omni_bank_reserves`, and `grid_operator_policy_rules`. Confirm grants and intended access separately; RLS enabled/no policies is not by itself proof of public exposure.
- `public.grid_verification_factors` had RLS enabled but broad direct grants to `anon` and `authenticated` (including write/truncate privileges) in the earlier live audit. PR #130 addresses this via a migration proposal, not a live change.
- A `SECURITY DEFINER` function `grid_verify_three_factors(p_codeword text, p_recovery_phrase text)` returns per-factor verification booleans. Review call sites, rate limiting, and whether the detailed result enables an online guessing oracle. Treat this as a risk to assess, not a confirmed exploit.
- Legacy mining RPCs and browser writes to `grid_combat_state` were previously restricted; Edge Function `grid-combat` version 21 was reported deployed with JWT verification and removal of a stale-sync movement bypass. Remaining work noted earlier: server-owned world/session identity, validated state transitions, movement plausibility, replay/range/cooldown protections, atomic mining credit, and authenticated E2E mining tests. Keep browser mining disabled until the full gate passes.

## Next actions (ordered)
1. Check CI for PR #133's newest head `a943d3e5e61b4d2f0713f4a42227949d699315d9`; the confirmed successful run #1510 is for the prior head `9e0e1bd6d37b7d112300cd2ccb0d571796657acd`.
2. Resolve the PR #131/#133 overlap and preserve the database revocation migration if recovery hardening is approved.
3. Review and correct handling of Supabase SDK's returned `error` value in `resetPasswordForEmail`, without exposing account existence.
4. Verify Supabase redirect allowlist and test actual password reset email end-to-end in a safe test account.
5. PR #129's CI run #1505 has now been rechecked and completed successfully. Inspect legitimate server-side access paths before approving PR #130.
6. Continue the least-privilege audit of sensitive `SECURITY DEFINER` functions, beginning with verification-factor flows and rate limiting.
7. Continue recording substantial work, exact branch/commit/PR, CI status, deployment status, unresolved risks, and next action in this log and the shared engineering handoff.

## Working protocol
- Read `docs/ENGINEERING_STATE.md`, `docs/AURORA_ENGINEERING_HANDOFF.md`, and `docs/AURORA_WORK_QUEUE.md` before broad Grid World work; respect their canon and Aurora's existing work.
- Distinguish code on a branch, open PR, merged main, CI, and deployed behavior.
- No merging, production database changes, or deployment without explicit approval.
- Append a dated entry after each substantial work session. Do not rewrite prior dated findings as if they were newly verified.
