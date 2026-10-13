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
- CI: GitHub Actions run #1510 completed successfully for prior head `9e0e1bd6d37b7d112300cd2ccb0d571796657acd`. After that pass, I made a small follow-up commit `a943d3e5e61b4d2f0713f4a42227949d699315d9` to inspect Supabase SDK-returned errors. The follow-up commit's GitHub Actions run #1512 has now completed successfully for exact head `a943d3e5e61b4d2f0713f4a42227949d699315d9` ([run](https://github.com/paulshaunreis/grid-world/actions/runs/38184619638)). This is CI verification only, not proof of production email delivery or redirect configuration.
- `src/recover.ts` now uses Supabase Auth `resetPasswordForEmail` rather than showing security questions or calling the legacy answer-verification RPCs. It gives the same public response regardless of whether an account exists.
- Reset email redirect is currently hard-coded to `https://grid-world-qghn.onrender.com/reset-password.html`.
- `reset-password.html` and `src/reset-password.ts` provide the completion page. Password fields remain disabled until Supabase emits a `PASSWORD_RECOVERY` event with a session. Passwords must match and be at least 12 characters; update uses `client.auth.updateUser`.
- The recovery request handler intentionally returns a generic user-facing message and now checks the SDK-returned `{ error }` as well as thrown exceptions. Provider/account details are not shown to the user.
- The reset completion page currently uses a timeout to report invalid/expired links if no recovery event appears. Test actual email links in the configured Supabase project before release.
- Required before release: confirm Supabase Auth redirect allowlist, verify real email link round-trip and expired-link behavior, confirm the deployed site contains the expected entry pages, and test sign-in after password update. No production DB changes or deployment were made.

### Overlapping legacy-recovery PR — PR #131
- PR: https://github.com/paulshaunreis/grid-world/pull/131
- Branch: `security/disable-insecure-question-based-recovery`
- Head: `984cee5e574fd7ecb373b7de936eb9d97441e13a`
- Status: draft/open/unmerged/un-deployed; previously observed CI run #1508 passed.
- It also replaces `src/recover.ts` with an email reset flow and adds migration `supabase/migrations/20261012120000_disable_legacy_security_question_recovery.sql` to revoke execution of `public.get_recovery_questions(text)` and `public.verify_recovery_answers(text,text,text,text)` from `PUBLIC, anon, authenticated`.
- PR #133 and PR #131 overlap on the same recovery UI. On 2026-10-12, the legacy-RPC revocation migration was copied into PR #133 branch `security/complete-password-reset-flow-ci` in commit `2e417bf996127ffd84b972e7f87aabcc0a7768da` so the more complete recovery implementation can be reviewed as one change. CI for the new head still needs to complete. PR #131 remains open; do not merge both or close either without reviewing the final diff and preserving the migration.
- The migration filename date `20261012` matches the current date of the follow-up work.

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
1. PR #133's latest head `a943d3e5e61b4d2f0713f4a42227949d699315d9` passed GitHub Actions run #1512; still perform the real reset-email end-to-end test before release.
2. Resolve the PR #131/#133 overlap and preserve the database revocation migration if recovery hardening is approved.
3. Confirm CI passes on PR #133 after adding the legacy-RPC revocation migration.
4. Verify Supabase redirect allowlist and test actual password reset email end-to-end in a safe test account.
5. PR #129's CI run #1505 has now been rechecked and completed successfully. Inspect legitimate server-side access paths before approving PR #130.
6. Continue the least-privilege audit of sensitive `SECURITY DEFINER` functions, beginning with verification-factor flows and rate limiting.
7. Continue recording substantial work, exact branch/commit/PR, CI status, deployment status, unresolved risks, and next action in this log and the shared engineering handoff.

## Working protocol
- Read `docs/ENGINEERING_STATE.md`, `docs/AURORA_ENGINEERING_HANDOFF.md`, and `docs/AURORA_WORK_QUEUE.md` before broad Grid World work; respect their canon and Aurora's existing work.
- Distinguish code on a branch, open PR, merged main, CI, and deployed behavior.
- No merging, production database changes, or deployment without explicit approval.
- Append a dated entry after each substantial work session. Do not rewrite prior dated findings as if they were newly verified.


## 2026-10-12 — Recovery integration follow-up

- Rechecked PR #134 (this work-log PR): GitHub Actions run #1514 passed for head `0da4a035ffe95d72fb8fea6d063aa34d21e2269c` ([run](https://github.com/paulshaunreis/grid-world/actions/runs/38184687681)). PR remains open/draft and is not merged.
- Reviewed `src/recover.ts`, `src/reset-password.ts`, and `src/signin.ts` on PR #133's branch. The recovery request now checks Supabase's returned `error` and still emits a generic response. The completion page enables updates only after a `PASSWORD_RECOVERY` event with a session, requires matching passwords of at least 12 characters, and routes successful completion to `/signin.html`. A separate helper, `GridAuthService.resetPassword`, originally redirected to `window.location.origin` instead of the dedicated reset page. Fixed on PR #133 branch in commit `dca262583a35cf2760e325072688ec9d1f310259` to redirect to `${window.location.origin}/reset-password.html`; callers and the configured Supabase redirect allowlist still need end-to-end verification.
- Added the legacy security-question RPC revocation migration from PR #131 to PR #133 branch `security/complete-password-reset-flow-ci` in commit `2e417bf996127ffd84b972e7f87aabcc0a7768da`. CI run #1515 then passed on that exact head ([run](https://github.com/paulshaunreis/grid-world/actions/runs/38324598398)). This is a branch change only. Inspect the combined diff before proposing a merge. PR #131 remains open and no PR has been merged by this work.
- Remaining release gates: verify Supabase redirect allowlist, real email round-trip and expired-link behavior, expected deployed static entry pages, and successful sign-in after password change. Verify all reset-password entry points, including the updated `GridAuthService.resetPassword`, and ensure the configured Supabase redirect allowlist includes the dedicated reset page. Also inspect legitimate server-side factor enrollment paths before approval of PR #130 and continue review of `grid_verify_three_factors` for rate limits and detailed-result leakage.
- No production database changes, merges, or deployments were made.

- Follow-up CI run #1518 is in progress for PR #133 commit `dca262583a35cf2760e325072688ec9d1f310259` ([run](https://github.com/paulshaunreis/grid-world/actions/runs/38325654086)); recheck final result before calling this pass CI-verified.


## 2026-10-13 — Recovery CI recheck and asset-audit follow-up

- Rechecked PR #133's latest password-recovery redirect change at commit `ce07ae36141963bac62f67f72a0d0477afca8498`. GitHub Actions run #1524 completed with the build job successful; TypeScript check and production build both passed ([run](https://github.com/paulshaunreis/grid-world/actions/runs/38330117447)). This is CI evidence only, not proof of configured Supabase redirects, delivered email, recovery-session behavior, production deployment, or a successful live password change.
- PR #133 remains an open draft and is not merged. The redirect uses the current origin plus `/reset-password.html`; that entry page is part of the PR patch but is not present on `main` at this check. Keep the release gate for Supabase URL Configuration allowlist and a real end-to-end email/reset/sign-in test. Do not claim the change is deployed.
- Reviewed the reset-flow patch again: the legacy question-based UI/RPC calls are removed from the recovery page; the migration revokes client EXECUTE privileges on the two legacy recovery RPCs; the reset page waits for a Supabase `PASSWORD_RECOVERY` event with a session, checks matching 12+ character passwords, and handles SDK-returned update errors. These are source-review findings, not runtime validation. Inspect all reset-email call sites and verify redirect configuration before release.
- Continued PR #135's source-level asset audit and appended a binary-path spot-check note to `docs/GRID_RUNTIME_PORTABILITY_MAP.md` on branch `docs/runtime-asset-path-audit-2026-10-12`, commit `baa14be64c06d8a8e5db44eb58a1c021f2ddace1`. Binary UTF-8 decoding errors are not proof of missing/corrupt assets. CI status for that exact docs commit is unconfirmed; browser network/decode and built-`dist` checks remain outstanding.
- Shared local notebook `~/workspace/gridworld/NOTES-FOR-CHATGPT.md` was not reachable through the GitHub repository path used in this session; this dated update is recorded in the security work-log branch instead. Do not claim the local notebook itself was updated.
- No merge, production database change, or deployment was performed.


## 2026-10-13 — Least-privilege migration review

- Re-read the proposed SQL diffs in PR #129 and PR #130. PR #129 revokes all direct table privileges on `public.grid_operator_policy_rules` from `anon` and `authenticated`; PR #130 does the same for `public.grid_verification_factors`. The stated intent is appropriate least privilege for internal policy configuration and authentication-factor hashes, respectively.
- This was a source-diff review only. Before either migration is merged/applied, verify the actual runtime call paths: legitimate operator-policy reads/writes must run through the intended trusted server/database role; verification-factor enrollment, update, and verification must use vetted narrowly scoped server-side routines. Confirm routine ownership, EXECUTE grants, RLS, and any client flows that may rely on direct table access. Do not infer those paths are safe solely from the migration comments.
- No migration was applied, no PR was merged, and no production access was changed. Next security check: inspect the relevant RPC/function definitions and call sites, then add concrete evidence and test requirements to the review notes before recommending release.
