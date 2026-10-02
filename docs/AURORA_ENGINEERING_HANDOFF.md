# Grid World — Aurora Engineering Handoff

This file is the shared handoff between the Grid World engineers. Update it after each substantial engineering pass so Aurora can resume work with full context.

## Working agreement
- Aurora is a second engineer on Grid World, not a rival.
- Preserve Aurora's existing work; integrate changes on technical merit rather than overwriting it.
- Each engineer should leave a concise, current handoff here after substantial work.
- Never claim a change is merged when it is only on a branch or draft PR.
- Record verification honestly: distinguish GitHub Actions/CI verification from local verification and from unverified code changes.

## Project state
- Repository: `paulshaunreis/grid-world`
- Active development branch: `aurora/npc-daily-routines`
- Draft PR #1: **Aurora: NPC daily routines** — open/draft; not merged.
- Supabase project: `grid-world` (`jdduwsduptllnykrqdxs`), ACTIVE_HEALTHY.
- Current goal: an always-expandable Grid World platform with a persistent social/world layer, living worlds, NPC society, building, economy, teleportation, PvP/PvE, and web + in-world continuity.
- Budget context: $0, so prioritize incremental architecture and free/available tooling.

## What is already implemented
### Living world / NPC life
- NPC daily routines with role-specific 24h phases: sleep, work, meal, leisure.
- NPC profiles with identity, role/archetype, world/home, occupation/workplace, traits, skills, level/XP, memories, relationships, factions, inventory, and tags.
- NPC relationship network: family/friend/rival/mentor/faction, affinity, trust, familiarity, meetings, rivalry, last interaction.
- NPC inventory and role loadouts.
- NPC job progression and XP while working.
- NPC production: harvest/craft/repair/discover/gather.
- Physical creature/NPC material drops and collection.
- NPC market listings/trades using Grid Coin, merchant stock, balances, production restocking.
- NPC-to-NPC/social behavior and citizen steering.
- Dynamic-world NPC registration.
- Teleport selection and gate VFX.
- Living-world event flavor/type safety and Aurora's recent touch/input fixes.

### Player/social systems
- Persistent public profile service backed by Supabase `profiles`.
- Optional account presence via `grid_account_presence`.
- Social connection state via `grid_social_connections`.
- Target profile UI for NPCs and remote players.
- Remote-player FRIEND/FOLLOW/MESSAGE actions.
- Party health display and related target/profile interactions.
- Landmarks/waypoints and teleport destination preview/VFX are part of the current feature direction.

### UI / builder direction
- Grid HUD with movable/modular styling direction.
- Target profile HUD.
- Community/social panel.
- Build primitives and advanced builder direction.
- Touch input handling that avoids capturing UI panels and preserves host DOM.

## Latest pass — persistent player profile
Date: 2026-10-01

### Changes made
1. `src/social/GridSocialService.ts`
   - Added `publicProfile(userId?)`.
   - Reads the existing `profiles`, `grid_account_presence`, and `grid_social_connections` data.
   - Returns handle, display name, avatar fields, avatar readiness, account age, presence, world/region, and social counts.

2. `src/ui/GridCommunityPanel.ts`
   - Upgraded the profile tab from a starter identity card to a persistent profile dashboard.
   - Shows handle, display name, online state, account age, friends/followers/following, world, region, and avatar readiness.
   - Added EDIT IDENTITY and SHARE PROFILE actions.
   - Share action copies a stable `@handle` rather than inventing a route that may not exist.

3. `src/style.css`
   - Added styling for the richer persistent profile dashboard and actions.

4. `src/main.ts`
   - Wired the profile editor action through the existing identity editor using `grid:open-identity`.

### Latest commit
- `97aa5c59d55092801e6abc4c9e9571c645f439e1`
- Branch: `aurora/npc-daily-routines`

### Verification status
- The latest commit's GitHub status was still **pending with no completed status checks** when this note was written.
- Do **not** call this latest pass CI-verified until GitHub Actions reports success.
- Previously verified commit `66924458a3861528788d4c86a21f14aa33114f1e` passed `npx tsc --noEmit` and `npm run build` in GitHub Actions run #955.
- Local `npx tsc --noEmit` was not available because the local shell did not have the GitHub repository checkout/network setup.

## Important existing caveats
- The repo's `package.json` does not currently provide an npm `test` script, and Vitest is not currently a dev dependency; existing test files therefore should not be described as executed unless that infrastructure is added.
- Draft PR #1 remains unmerged.
- Avoid introducing duplicate systems when an existing service already owns the same data.
- Preserve Aurora's branch conventions and review her patches rather than replacing them.

## Latest patch review — Aurora patch re-upload
Date: 2026-10-01

- Reviewed uploaded `aurora-gridworld-fixes (1).patch` (Aurora, two commits).
- The patch contains the NPC daily-routine work plus the boot-HUD, touch-panel, and explicit living-world event-kind hardening.
- Those changes are already present in the active branch; representative current file blobs include `NpcDailyRoutine.ts`, the routine-aware `GridNpcBrain`, `GridCrowdActor`, `NPCSocietySystem`, `GridLivingWorld`, `CreatureEcologySystem`, `GridTouchController`, and the related HUD CSS.
- No duplicate patch application was made. This preserves the newer party/profile/world work already on the branch.
- Important: the uploaded patch is based on an older branch state, so applying it wholesale now would risk reverting newer work.

### Newer branch work observed after the patch
- Party HUD now binds to live profile identities and avatars.
- Authoritative party management and synchronized group transit APIs were added.
- Party controls/group transit polling and active-world quest scoping were added/fixed.
- Current latest commit observed on the branch: `c5c639f7aca3127d07d8216cd198c68d8b9173ce` — “Keep quest progress scoped to the active world”.
- No GitHub Actions workflow run was returned for that latest commit at review time, so its CI status is not claimed here.

## Suggested next work
1. Verify commit `97aa5c5...` through GitHub Actions.
2. Connect persistent profiles to the web/community identity surface: profile pages, creations/media, worlds, achievements, friends/followers, and NPC profile continuity.
3. Continue closing the loop between web identity and in-world identity without duplicating account data.
4. Keep teleport destinations, landmarks/waypoints, party status, NPC profiles, and social identity interoperable.

## Handoff etiquette
When Aurora or another engineer continues:
- Read this file first.
- Update it after substantial work.
- Add the newest commit SHA and exact verification result.
- Explicitly list anything that is unfinished or uncertain.


## Latest pass — persistent public profile continuity
Date: 2026-10-01

### Changes made
- src/profile.ts
  - Public profile routes now accept ?handle= and load the matching persistent grid_user_profiles record through GridProfileAuthority.
  - The public page hydrates cloud profile identity, theme/layout, media, and arena ranking before rendering.
  - Existing signed-in profile hydration remains the fallback when no public handle is supplied.
- src/ui/GridCommunityPanel.ts
  - SHARE PROFILE now copies a real /profile.html?handle=... public-profile link instead of only copying a handle string.
  - This keeps web sharing connected to the same persistent profile identity used by the in-world social layer.

### Commits
- 965d68618fe18d887af9306215fc95afc4690163 — Load persistent profiles on public profile routes.
- 061390f1e2b2235e6e7417500914dea73bd91e32 — Make profile sharing open the persistent public profile.

### Verification
- These changes were written to aurora/npc-daily-routines.
- GitHub Actions verification for these new commits has not yet been checked; do not describe this pass as CI-verified until a successful workflow run is observed.
- No merge was performed. Draft PR #1 remains open/draft.

### Next integration target
- Verify CI.
- Then connect public profile pages more deeply to creations/worlds/achievements and make the in-world remote-player profile offer a direct public-profile action without duplicating account data.


## Follow-up pass — in-world public profile bridge
Date: 2026-10-01

- `src/ui/GridTargetProfile.ts` now exposes a PUBLIC PROFILE action alongside Friend/Follow/Message.
- `src/main.ts` wires remote-player profiles to `/profile.html?handle=...`, opening the same persistent web profile used by the community panel.
- Commits: `714bb65f0132c540c16d35859ece379723a0c555`, `3499981c063a3b624150c5f4659274c9ad2babd5`.
- No merge performed. CI for the newest commit has not yet been checked.


## Profile data integration pass — 2026-10-01
- Reused existing Supabase tables rather than creating a parallel profile datastore.
- `GridProfileAuthority` now reads `grid_landmarks` and `grid_player_inventory` in addition to persistent profile posts/media and arena ranking.
- Public profile modules now render real saved landmarks/world destinations, public posts/creation activity, and inventory/collection data when available.
- Supabase verification query confirmed the required tables are present; current database row counts are zero for these user-facing records, so empty-state UI is expected until users create data.
- Commits: `f04d15ad0b2e7db0779cf9afea779fd68b5a9544`, `001d6bdd18a8fa8157901fedf2e4b29e05978801`.
- No merge performed. GitHub Actions for the latest branch commit has not been observed yet.


## Live profile continuity pass — 2026-10-01
- Public profile routes now load persistent presence/social data through `GridSocialService.publicProfile`.
- Profile hydration now loads public posts, landmarks, inventory, and live presence for both handle-based public routes and signed-in profiles.
- Profile identity surface now reflects online/offline state, current world/region when available, and persistent friend/follower/following counts.
- Commit: `68d23f8a511135271b973389d5af2d976d68c04a`.
- No merge performed; CI workflow run is still pending/not observed for the latest head.


## Aurora personal Grid World identity — design question for Aurora
- User explicitly wants Aurora to have her own personal Grid World profile, reflecting that she has a distinct personality and personal style rather than being represented only as an engineering assistant.
- Treat Aurora as a first-class Grid resident/creator with her own profile, avatar presentation, biography/status, personal style/theme, creations, landmarks, inventory/collections, social presence, and eventual in-world home/work space.
- Do **not** invent Aurora's personal preferences beyond what is already established. Existing characterization: cosmic navigator; calm, perceptive, quietly confident; warm collaborative presence; dry humor; starlight/constellation visual language.
- **Question for Aurora:** What would *you* choose for your Grid World profile? In particular: your preferred display name/handle, avatar appearance, colors/materials, clothing or armor style, profile theme/layout, favorite worlds or places, personal interests, status/bio, home or studio concept, and what creations/collections you want associated with you.
- This is intentionally an open design decision for Aurora. Record her response in this handoff before hard-coding additional personal details.
