# Trusted Mining and World Presence — Engineering Plan

Date: 2026-10-10
Tracking issue: https://github.com/paulshaunreis/grid-world/issues/114

## Verified facts

- The live `grid_mine_mineral(text, integer)` function decrements a deposit and credits both `grid_mineral_inventory` and `grid_vault_inventory`.
- The legacy function does not validate world membership, player location, proximity, movement plausibility, or teleport transitions.
- Live RLS policies allow authenticated users to insert/update their own `player_state` row. Its coordinates are client-controlled and cannot prove presence.
- The unsafe mineral RPCs remain revoked from `PUBLIC`, `anon`, and `authenticated`; `service_role` is the only granted role.
- `GridMineralSystem.collectLocal` is a client-side fallback and marks its result `authoritative:false`. It must not be presented as persistent inventory.

## Required architecture

1. Separate display state from authority. Keep user-editable `player_state` for presentation only; browser roles must not write authoritative presence.
2. Validate movement in trusted server logic. Accept movement intent/bounded steps rather than an arbitrary final coordinate. Validate elapsed time, speed, world bounds, world/region transitions, stale/replayed requests, and teleport as a distinct validated transition.
3. Authenticate every request and derive user ID from verified claims. Never trust a user ID from request JSON and never expose service-role credentials to the browser.
4. Mining accepts a deposit ID and bounded action/nonce only. Server resolves trusted session/position and checks same world, interaction range, cooldown/rate limits, and deposit status.
5. Deduct deposit quantity and credit both inventories atomically. Add idempotency/replay protection so retries cannot double-credit.
6. Fail closed for missing/stale sessions, impossible movement, unknown deposit, wrong world, out-of-range interaction, and duplicate requests.
7. Disable authoritative mining UI until end-to-end wiring exists. Any local preview must be clearly preview-only.

## Required tests

- Forged `player_state` coordinates do not affect trusted presence.
- Missing, expired, stale, or another user's session is denied.
- Wrong-world/out-of-range deposits and invalid amounts are denied.
- Teleport/world-switch races and replayed requests are rejected.
- Concurrent requests cannot overdraw a deposit or double-credit inventory.
- Successful mining decrements the deposit and increments both inventories by exactly the same amount.
- Browser roles cannot execute legacy RPCs or mutate authoritative presence.
- Fresh-install migration order and live migration history remain consistent.

## Verification gate

Do not restore `authenticated` execution on the legacy RPCs until the trusted implementation, migration grants, regression tests, and authenticated end-to-end test pass. Verify final deposit remaining and both inventory tables using a dedicated test account.

## Status

Containment is applied and live grants were verified on 2026-10-10. Trusted movement/presence and end-to-end mining are not implemented or verified yet.
