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


## 2026-10-13 — Follow-up access-path investigation

- Re-fetched PR #129 and #130 metadata and exact proposed SQL diffs. Current heads: #129 `ae7336ea49e0d4467766825629bd601f514b60a4`; #130 `251dffe603fece31b127bcf15115a4e0b532656a`. Both remain open and unmerged. Each patch contains only a `REVOKE ALL PRIVILEGES` against its named table for `anon, authenticated`; neither patch itself defines or tests a replacement RPC.
- Attempted repository code search for `grid_operator_policy_rules`, `grid_verification_factors`, and `grid_verify_three_factors`. The connected GitHub code-search tool returned no indexed matches for these queries. This is a search-tool limitation, not evidence that no routines/call sites exist. As a result, I cannot yet verify trusted routine ownership, EXECUTE grants, pinned `search_path`, authorization checks, client call sites, or rate limiting from source evidence. Do not approve/apply either grant-revocation migration until those paths are located and tested.
- Rechecked this work-log PR (#134). GitHub Actions run #1527 completed successfully for exact head `ec0d4c1c1112e99ff1857bc53f228eed4fefbe08` ([run](https://github.com/paulshaunreis/grid-world/actions/runs/38460118335)). Documentation CI is green; PR #134 remains open/draft and unmerged.
- Security review conclusion: the privilege revocations are directionally sound least-privilege proposals, but safe rollout is **not yet demonstrated** because the legitimate access paths are unverified. Next: obtain source for the relevant Supabase migrations/functions and browser call sites through a repository tree/branch-aware retrieval path; trace each function end-to-end; add tests for allowed and denied roles, expected enrollment/verification/operator flows, and rate limits before recommending merge.
- No production database changes, merges, or deployments were performed.


## 2026-10-13 — Trusted Edge Function path found

- Retrieved `supabase/functions/grid-operator/index.ts` from `main` (blob `8acb6160f5752191cc61403592854225a86291f4`). The function constructs a Supabase client from `SUPABASE_SERVICE_ROLE_KEY`, validates a supplied bearer token using `admin.auth.getUser(...)`, and loads enabled `grid_operator_policy_rules` through the service-role client inside the authenticated user's account context. This is concrete source evidence for the intended trusted operator-policy read path; it is not a live deployment check.
- Related PR #82's description records an earlier RLS validation: browser roles saw zero rows while a service-role read succeeded. However, PR #82 is currently open/unmerged in the connector snapshot, so its description is historical project evidence, not proof of current live database state. PR #129's direct-grant revocation still needs post-migration privilege checks and a test that the Edge Function can read rules.
- The same `grid-operator` function's `verify-status` action requires a valid user and selects only that user's factor labels/type/enrollment timestamp through the service-role client. This is a status-read path only; it does not establish how factor enrollment, updates, or `grid_verify_three_factors` verification are implemented, nor does it resolve rate limiting.
- GitHub code search still returns no indexed matches for the factor table/function, so enrollment/update/verification call sites remain unverified. Do not treat search failure as proof that these are absent.
- PR #134's work-log update at commit `168dfe8f66bb85a40da4982d22a93cb46e89c6f4` now has successful GitHub Actions run #1528 ([run](https://github.com/paulshaunreis/grid-world/actions/runs/38461020620)). Documentation CI is green; PR remains open/draft and unmerged.
- Next: locate and trace the enrollment/update and verification routines, validate auth/authorization and brute-force protections, then run explicit post-migration checks for browser-role grants and operator function access. No production changes, merge, or deployment performed.


## 2026-10-13 — Operator endpoint and forum trust-boundary review

### Grid Operator Edge Function — source review only
- Reviewed `supabase/functions/grid-operator/index.ts` on `main`, blob `8acb6160f5752191cc61403592854225a86291f4`.
- The function validates a supplied bearer token with `admin.auth.getUser`; its `context` path then reads the current user's profile, social preferences, open operator cases, and enabled policy rules through the service-role client. The `verify-status` action requires authentication and filters factor status by the authenticated user's ID. This supports the intended server-side read path for PR #129, but does not prove live deployment state or post-migration grants.
- **Additional review items (not confirmed exploits):** `chat` and `moderate` actions are accepted without requiring a signed-in user; this source file shows no explicit per-user/IP rate limiter. Authenticated chat context, including profile/preferences/open cases, is serialized and sent to the configured external AI gateway. Confirm privacy disclosure, vendor/data-retention expectations, and minimize fields sent where possible. The catch handler returns `e.message` in a 500 response; prefer a stable generic client error with server-side correlation logging. Validate moderation model output against an allowlisted schema before returning it or using fields in database writes.
- `Access-Control-Allow-Origin: *` is present. This alone is not authentication bypass, but the public endpoint and unauthenticated actions make abuse controls, quotas, payload caps, and monitoring worth explicit verification. Do not label these findings exploitable without runtime tests.
- No function code changed, no production changes made, and no deployment performed.

### Forum foundation — trust boundary and persistence
- Reviewed `src/social/messageBoard.ts` on `main`, blob `7a9882b0773986077576ebcd96a4640983d50032`, and PR #127 (https://github.com/paulshaunreis/grid-world/pull/127).
- Posts and replies are stored only in browser `localStorage`; the Supabase mirror is a comment, not implemented functionality. Therefore the current board is not cross-device/shared persistence and browser-side ownership checks are not an authoritative moderation boundary.
- `deleteBoardPost` trusts a caller-provided handle and includes a special `aurora` exception. In local-only UI this is not a server privilege boundary, but it must not be reused as an authoritative permission check for shared posts. A future backend should derive identity from the authenticated session, enforce author/moderator permissions server-side, validate content and rating at the database boundary, and add abuse/reporting controls.
- PR #127 remains open; its body states build, automated checks, and browser/device verification have not yet been run. No merge/deployment performed.

### CI and next actions
- Rechecked PR #134 documentation commit `c12451cde5fd1d6c505124e1deb48bb4481a2cf9`: GitHub Actions run #1529 completed successfully. This verifies the CI job only; PR #134 remains open/draft and unmerged.
- Next security sequence: (1) trace the three-factor enrollment and verification call sites and rate limiting; (2) add explicit abuse controls and generic client errors to Grid Operator if source/runtime review confirms gaps; (3) define data-minimization and disclosure requirements for AI-gateway context; (4) verify PR #129/#130 grants after an approved migration in a safe environment; (5) design the forum backend only after auditing existing tables, migrations, and RLS.
- Shared local notebook `~/workspace/gridworld/NOTES-FOR-CHATGPT.md` was not directly accessible in this environment; this dated repo work-log entry is the recorded handoff. No merge, production database change, or deployment was made.


## 2026-10-13 — Live database trace: three-factor verification

Read-only inspection of the connected Supabase project `grid-world` (project ref `jdduwsduptllnykrqdxs`) recovered the live function definitions and current grants/policies. No SQL changes were made.

### Confirmed live definitions
- `public.grid_enroll_verification(p_codeword text, p_recovery_phrase text)` is `SECURITY DEFINER`, owned by `postgres` (per function ACL), and executable by `authenticated` and `service_role`. Its body requires codeword length >= 8 and recovery phrase length >= 12; checks the caller's `auth.users.email_confirmed_at`; stores SHA-256 digests of lowercased/trimmed values; and inserts or updates the caller's row via `auth.uid()`.
- **Security question for review:** the upsert replaces existing factor hashes whenever the signed-in user with a confirmed email calls enrollment; the current body does not require proof of the existing factors, recent reauthentication, or a recent-auth timestamp before replacing them. This may be acceptable for initial enrollment but is a potential factor-reset weakness if the same RPC is the update path. Confirm product intent and call sites before classifying it as exploitable.
- `public.grid_verify_three_factors(p_codeword text, p_recovery_phrase text)` is also `SECURITY DEFINER`, executable by `authenticated` and `service_role`. It compares submitted values to hashes for `auth.uid()` and returns JSON with an overall boolean **plus separate `email_verified`, `codeword_verified`, and `recovery_verified` booleans**. The body contains no explicit attempt counter, cooldown, lockout, or rate-limit check. Detailed per-factor booleans may provide a partial-answer oracle; test whether the result is used for actual authorization or only account UX before final severity.
- Both functions pin `search_path` to `public, auth`. This is pinned, but Supabase's current guidance recommends an empty search path with every object schema-qualified for SECURITY DEFINER routines; review extension function schema placement before changing this.
- Current table grants query confirms `anon` and `authenticated` have direct table privileges including SELECT/INSERT/UPDATE/DELETE and TRUNCATE on `public.grid_verification_factors`; the only listed RLS policy is authenticated SELECT where `user_id = auth.uid()`. RLS does not protect TRUNCATE. This directly supports the least-privilege objective in PR #130, but does not prove that PR is merged or that the proposed revocation is deployed.
- No application caller for `grid_enroll_verification` or `grid_verify_three_factors` was found through GitHub's indexed code search, and the guessed frontend paths did not identify one. This is a search limitation, not evidence that no callers exist. Need a repository-wide local grep or broader source retrieval to complete call-site tracing.

### Next actions
1. Locate all RPC call sites and decide whether the verification routine gates sensitive actions. If it does, replace detailed factor booleans with a single generic result for client callers unless there is a justified, safe UX need.
2. Design server-side attempt throttling/lockout that survives client resets and is scoped by account plus network/device abuse signals; avoid storing raw secrets or exposing whether individual factors matched.
3. Decide whether factor replacement requires recent authentication or existing-factor verification; test enrollment, change, and recovery separately.
4. Before approving PR #130, verify the migration removes browser-role table privileges while preserving the intended SECURITY DEFINER RPC path. After approved deployment, test anon/authenticated grants and legitimate factor flows in a safe test account.
5. Add database tests for ownership isolation, missing/invalid auth, short secrets, confirmed/unconfirmed email, repeat enrollment, wrong-factor responses, and rate limits. Do not make production changes until the intended flow and tests are clear.

Sources: live read-only SQL queries against the connected project; Supabase guidance on SECURITY DEFINER and function EXECUTE privileges: https://supabase.com/docs/guides/database/functions and https://supabase.com/docs/guides/api/securing-your-api. No migration, merge, or deployment was performed.


## 2026-10-13 — Verification RPC privilege and migration-history check

- Re-queried live PostgreSQL function definitions and ACLs for the two verification routines. Both are SECURITY DEFINER and explicitly executable by authenticated and service_role; the ACLs returned do not include PUBLIC or anon. Their caller identity is derived from auth.uid(), and enrollment writes only the row for that identity. This means PR #130's table-level revocation should not, by itself, block execution of these routines for authenticated users; this is a source/privilege analysis, not a functional test.
- The live migration history returned by Supabase does not include a verification-factor direct-grant revocation migration. This is consistent with PR #130 still being a proposal and does not substitute for checking the repository's current PR state or actual grants after any future rollout.
- Repeated GitHub indexed-code searches for grid_enroll_verification, grid_verify_three_factors, verification_factors, and recovery phrase returned no results. Treat this strictly as a connector indexing limitation; caller tracing remains incomplete. A repository-wide checkout/grep or branch-aware source retrieval is still needed before claiming all client call sites have been inspected.
- The main functional risks remain: enrollment can replace existing hashes without proving old factors or recent reauthentication; verification returns per-factor match booleans; the function body has no explicit persistent attempt throttling. These are confirmed code properties, while exploitability and severity depend on actual call sites and downstream authorization use.
- Recommended next change is not to modify production or prematurely alter the RPC contract. First retrieve a complete source tree and trace every invocation; then implement tests and a narrowly scoped server-side rate-limit/factor-change design. PR #130 can proceed to review only with a documented test showing authenticated RPC calls still work after table privileges are revoked, plus negative tests for direct table access. No database mutation, merge, or deployment performed.


## 2026-10-13 — Verification call site traced and hardening proposed

- Retrieved the complete `main` Git tree through GitHub's Git Data API (894 entries; not truncated), then fetched the exact client call sites. `src/operator/GridOperatorService.ts` calls `grid_enroll_verification` and `grid_verify_three_factors` directly through Supabase RPC. `src/ui/GridOperatorPanel.ts` checks `status.enrolled`, then calls verify when enrolled and enroll otherwise. This establishes that the RPC is reachable directly from the authenticated browser client and that the current UI does not offer a legitimate factor-rotation flow.
- Confirmed why enrollment replacement matters: the UI's status check is only a convenience gate; any authenticated caller can invoke the RPC directly. The old database function used `ON CONFLICT DO UPDATE`, so it could replace hashes without proving the old factors. This is a concrete security weakness in the current live function contract, not merely a speculative code search result.
- Expanded PR #130 on branch `security/revoke-client-verification-factor-grants`, latest head `eb7924c5707661971bc40388c8fd478de16d57c9` (open, unmerged, not deployed): https://github.com/paulshaunreis/grid-world/pull/130. In addition to revoking direct table privileges, the branch now proposes migration `supabase/migrations/20261013140000_harden_three_factor_verification.sql`: reject repeat enrollment, add an RLS-enabled server-only attempt table, impose five failed attempts per account per 15-minute window followed by a 15-minute cooldown, remove per-factor booleans from verification responses, and explicitly restrict function EXECUTE to authenticated/service_role. Client UI now catches verification/enrollment errors generically, and service typing only exposes `{ verified: boolean }`.
- Added `supabase/tests/grid_verification_security.sql` with structural regression assertions for table privileges, anonymous versus authenticated RPC grants, per-factor response leakage, enrollment replacement, and cooldown code. This test file has not yet been executed against a disposable database; it is not runtime proof.
- GitHub Actions run #1534 for exact head `eb7924c5707661971bc40388c8fd478de16d57c9` was in progress at last check ([run](https://github.com/paulshaunreis/grid-world/actions/runs/38467110011)). Combined commit status endpoint returned no statuses, so CI must be rechecked.
- Important limitations/gates: no production SQL, merge, or deployment occurred. The account-level cooldown does not itself prevent distributed multi-account abuse. The SECURITY DEFINER functions still use the existing pinned `search_path = public, auth`; verify the digest function schema and consider further hardening. Test the SQL on a disposable Supabase database, including actual enrollment/duplicate enrollment, correct/wrong credentials, concurrent attempts, cooldown and expiry, and successful authenticated RPC calls after direct table privileges are revoked. Factor rotation/recovery needs a separate secure design before users can change enrolled secrets.
