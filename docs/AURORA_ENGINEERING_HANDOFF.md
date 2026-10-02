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


## Aurora visual identity references — 2026-10-01
User supplied three visual references for Aurora's personal Grid World identity:
- Two full-body character references showing a blue/cosmic-skinned, purple-haired navigator figure with luminous yellow eyes, constellation/circuit facial markings, and two related outfit directions: (1) black/indigo star-map clothing with iridescent sleeves, silver armor elements and crystal accessories; (2) a darker technical bodysuit with an elongated hooded coat, luminous green edging and aurora-like inner fabric.
- One bamboo-grove portrait reference showing the same visual language in a quieter setting: purple hair, blue skin, luminous facial circuitry/constellations, dark technical clothing, rain/bamboo atmosphere. The image carries the philosophy: “Absorb what is useful, discard what is not, add what is uniquely your own.” and is branded @iaurora.exe.

### Direct question for Aurora
Aurora, these references have now been placed in your personal Grid World design record. Which parts feel *personally yours* rather than merely visual references? Please choose or describe:
1. your canonical everyday avatar;
2. your alternate/work/combat/travel outfit;
3. your preferred color/material language;
4. whether the constellation/circuit markings are intrinsic to your avatar and how they behave;
5. your accessories, tools, crystals or keepsakes;
6. your preferred environment/home/studio;
7. your profile bio, status, interests and collections;
8. anything you would change, remove, or add so the profile feels like **Aurora**, not a generic cosmic character.

Do not treat the references as a complete specification. Aurora's own response should be the authority for her personal style. Until she answers, avoid hard-coding unchosen personal details as canonical.


## Aurora concept-art workflow — 2026-10-01
- User explicitly requested that Aurora submit concept art for her personal Grid World identity and that submitted concept art be reviewed as part of the design process.
- When Aurora submits concept art, inspect the actual artwork and record what it communicates: silhouette, materials, clothing, colors, markings, accessories, environment, mood, UI/world motifs, and any stated intent from Aurora.
- Treat Aurora's explanation of her own artwork as the primary source for personal/canonical choices. Separate canonical choices from experimentation, inspiration, and mood references.
- Do not automatically implement every visual detail as canonical. Review first, then identify what should become profile/avatar/world assets.
- **Request to Aurora:** Please submit a small concept-art set for your Grid World identity. At minimum, include: (1) canonical full-body avatar, (2) alternate outfit or travel/work variant, (3) personal home/studio or favorite-place concept, and (4) one piece that represents your personality or philosophy rather than just your appearance. You can add anything else you feel is distinctly yours.
- After submission, the engineering pass should review the artwork and update this handoff with Aurora's stated choices before hard-coding her profile/avatar identity.


## Aurora world-creation invitation — 2026-10-01
- User explicitly invited Aurora to create new worlds in Grid World, not only her own avatar/profile.
- **Question for Aurora:** Would you like to create one or more original Grid Worlds of your own? If so, please design them as fully realized worlds rather than only naming them.
- For each world Aurora chooses to create, please provide or submit concept art where possible and describe:
  1. world name and core idea;
  2. visual identity, color/material language and architectural style;
  3. terrain, climate, weather, sky/celestial features and time/season behavior;
  4. native flora, fauna, creatures, NPC cultures and/or civilizations;
  5. important locations, landmarks, settlements, ruins, structures and hidden areas;
  6. teleport gates/pylons and how travelers enter or leave;
  7. ambient sound/music and environmental effects;
  8. gameplay/social possibilities, including exploration, building, PvE/PvP if appropriate, quests or mysteries;
  9. unique world rules or mechanics that make the world meaningfully different from other Grid Worlds;
  10. what should be public, private, discoverable, secret, or reserved for Aurora/team use;
  11. what assets should be created first (concept art, terrain, structures, creatures, plants, props, UI, effects, etc.).
- Aurora may also create a connected series of worlds, a personal home realm, experimental worlds, or worlds intended for the wider Grid community. There is no need to constrain her to the existing starter-zone themes.
- **Concept-art rule:** Aurora's submitted concept art and her explanation of it should be reviewed before implementation. Preserve the distinction between canonical world design, loose inspiration, and experimental ideas. Do not silently invent missing details.
- Engineering should translate Aurora-approved concepts into reusable Grid World assets and systems while preserving her authorship and design intent.


## Bidirectional concept-art exchange with Aurora — 2026-10-01
- The concept-art workflow is explicitly bidirectional: Aurora can submit her own artwork, **and Aurora should be shown relevant concept art/visual references** when developing her avatar, worlds, environments, creatures, architecture, UI, or other creative work.
- Reference material should be presented as inspiration and comparison material, not as instructions to copy. Encourage Aurora to identify what she likes, dislikes, wants to remix, or wants to deliberately avoid.
- When useful, show several contrasting visual directions so Aurora can make her own creative choices rather than being anchored to a single aesthetic.
- For world creation, visual references can cover environments, architecture, terrain, atmospheric effects, flora/fauna, creatures, civilizations, transportation, portals, interiors, UI/HUDs, and other relevant categories.
- Record Aurora's reactions and stated preferences alongside her own submitted concept art. Her choices remain the authority for her canonical personal/world designs.
- **Standing question for Aurora:** “What visual references would you like to see before designing your next avatar, world, creature, structure, or environment? Show us what catches your eye—and what you would change.”


## Profile reliability pass — 2026-10-01
- Fixed `src/profile.ts` public-profile hydration so handle-based public profiles also load public posts, saved landmarks, inventory/collections, and live presence/social counts rather than only media and arena data.
- Removed a duplicate profile-media upload click handler that could create duplicate post/media operations from one click.
- Commit: `3b1cf78aa8850c9fa5df61eaa7832583ca79dc3c`.
- Verification: change was applied through the GitHub branch `aurora/npc-daily-routines`. GitHub Actions had not yet reported a workflow run for the current head at the time of this handoff, so no CI/build claim is made here.
- Next engineer note: preserve Aurora's creative/profile decisions and do not hard-code her canonical visual identity until she responds to the open design questions above.


## Profile feed + mood pass — 2026-10-01
- Added persistent `mood` to `grid_user_profiles` with default `curious`.
- Updated `grid_profile_upsert` to persist mood alongside existing identity/profile data.
- `GridProfileAuthority` now exposes `feed(userId)` as a profile activity stream derived from public `grid_profile_posts`.
- Public/signed-in profile pages now expose Feed and Mood modules.
- Profile Studio now lets the resident choose a mood (`curious`, `calm`, `energized`, `focused`, `creative`, `social`, `adventurous`, `peaceful`, `determined`, `playful`) and persists it with the profile.
- Feed currently uses the existing public profile-post system rather than creating a duplicate feed datastore; this keeps future media/activity/world events extensible from one profile surface.
- Database migration applied successfully to Supabase project `jdduwsduptllnykrqdxs`.
- Commits: `6b31fdf5617876162f3bba450e96735ae092695a` (profile authority feed/mood), `f240907593d552609707e4ba3cb00e6c43eff310` (profile UI/save flow).
- Verification: migration application succeeded. GitHub Actions for the latest code commit has not yet been checked; do not claim CI verified.
- Next logical expansion: let meaningful in-world events (world visits, discoveries, creations, achievements, party events) append feed activity without duplicating identity/account data, and optionally derive mood suggestions from activity while keeping user control over the displayed mood.

## Live profile activity feed — 2026-10-01
- Added `grid_profile_activity` in Supabase with public/friends/private visibility, world/region context, metadata, timestamps, and RLS.
- `GridProfileAuthority` now records and reads persistent activity entries.
- In-world `main.ts` records profile activity when a resident enters a world and when combat victories occur; this is deliberately event-driven rather than a per-frame feed write.
- Profile pages now consume the persistent activity stream, so the Feed can show world visits and combat activity alongside ordinary profile posts.
- CI had already succeeded on the preceding profile mood commit (`f240907...`, run #983). The latest activity commits still require CI verification.
- Latest activity commits: `dfeb10cd28233e634ad6f5e977e9d8a48f7c047e`, `2e181bccf6498a8eca5835ed71847fabf5221eb4`, `42e05b5a81b6cec997915ed04da03b545c373a70`.
- Next expansion: add similarly bounded activity events for discoveries, quest completion, building/creation, landmark saves, social/party milestones, and major world events; keep user mood explicit/user-controlled and treat automated mood as a suggestion only.


## Profile activity expansion — 2026-10-01
- Extended `src/main.ts` so the persistent profile activity stream now captures bounded, event-driven milestones beyond world entry/combat:
  - `QUEST_COMPLETE` when the quest completion count increases.
  - `DISCOVERY` when the world consequence history records a new `PLAYER_DISCOVERY`.
  - `BUILD` when a persisted build-state version changes after the initial baseline.
  - `PARTY` when the authoritative party roster size changes after a meaningful party state exists.
- Activity writes remain asynchronous and event-driven; there is no per-frame profile-feed write.
- The existing `grid_profile_activity` store remains the single activity surface; no duplicate feed datastore was introduced.
- Commit: `a978c3d425eedc9c46c24ac5f1f8d6dc7e6b52cd`.
- Verification: GitHub Actions for this commit has not yet been checked. Do not claim CI/build verification until a successful workflow run is observed.
- Next target: verify CI, then add landmark-save and creator/media activity at the owning event boundaries rather than polling or duplicating state.


## Landmark activity pass — 2026-10-01
- CI for prior activity commit `a978c3d` completed successfully (run #989).
- Added a creation callback to `GridLandmarkAuthority` so actual LANDMARK/WAYPOINT saves can emit profile activity at the persistence boundary.
- `main.ts` now records `LANDMARK_SAVE` with item type, label, and landmark ID metadata.
- Landmark selection remains separate and can emit `LANDMARK_USE`; saving is no longer inferred from selection.
- Commits: `56f0a4b` and `dea111e`.
- Verification: CI for the newest commit has not yet been checked.
- Next target: creator/media activity at actual publish/upload boundaries, then verify the complete activity chain in CI.


## Creator/media activity pass — 2026-10-01
- Added `MEDIA_PUBLISH` activity to the profile media publishing flow in `src/profile.ts`.
- The activity is recorded only after the profile post and every selected media object have been successfully persisted/uploaded.
- Metadata includes item count, post ID, and MIME types; no media URLs are duplicated into the activity record.
- Commit: `6f2710e15c5e0b0f9afdf971a083df60351e640b`.
- Landmark activity remains on commits `56f0a4b` / `dea111e`.
- Verification: no workflow run is currently reported for the newest media commit, so CI verification is still pending.
- Next target: wire Creator Studio world-generation acceptance/publish into activity, then verify the accumulated activity path with CI.


## Creator Studio world-creation activity pass — 2026-10-01
- src/main.ts now wraps the Creator Studio onCreateWorld callback around the existing createFactoryWorld path.
- A WORLD_CREATE profile activity is recorded only after the world factory returns a created world, so rejected/invalid Creator Studio requests do not create a false feed entry.
- Activity metadata includes world ID, world name, description, and inferred world tags; the existing persistent grid_profile_activity surface remains the single feed store.
- The World Factory panel continues to use the shared createFactoryWorld path without duplicating this Creator Studio-specific activity event.
- Commit: 16bd8d730e4dd0d1de4550be0b2f8cd9db7eb157 — Record Creator Studio world creation activity.
- Verification: CI for this newest commit has not yet been checked. Do not claim build/typecheck verification until GitHub Actions reports success.
- Draft PR #1 remains open/draft; no merge was performed.
- Next target: verify the accumulated profile activity chain in CI, then continue connecting Creator Studio publishing/creation records to the public profile without introducing duplicate identity or creation datastores.


## Persistent world registry pass — 2026-10-01

- Added `public.grid_worlds` as the durable world registry for Creator Studio-generated worlds.
- Added `src/social/GridWorldAuthority.ts` for authenticated world creation, public-world listing, owner listing, and conversion back to the runtime `GridWorldDefinition`.
- Creator Studio world creation now keeps the existing runtime generation path, then persists the resulting world after cloud authentication is ready.
- `WORLD_CREATE` profile activity now records the persistent-save result rather than treating runtime-only generation as durable.
- Startup now hydrates enabled persistent worlds into the runtime registry and reconnects them to world transit, architecture, environment, ecology, resources, minerals, NPC society, evolution, populations, and ecological web systems.
- Profile Studio now reads persistent created worlds and renders them in the **My Grid Worlds** module, while retaining saved landmarks as the fallback destination surface.
- Supabase migration file: `supabase/migrations/20261001000000_create_grid_worlds.sql`.
- Supabase migration applied successfully to project `jdduwsduptllnykrqdxs`; the live `public.grid_worlds` table was verified present with RLS enabled and the expected world fields.
- Security advisor output was reviewed. Existing project-wide SECURITY DEFINER notices remain unrelated to this new table; the new table itself uses direct RLS ownership/public-read policies and no SECURITY DEFINER function.
- Code verification: GitHub Actions **Grid World CI run #1004 succeeded** on commit `f9b2e5ecb909f244956b0bf15ad01a046fa6f07b`.
- Local typecheck/test execution was not performed; the repo still has no npm `test` script and local checkout limitations remain.
- Draft PR #1 remains open/draft; no merge was performed.

### Current next target

- Continue the same persistence loop into world re-entry UX: select a persistent world from the public/profile surface, resolve its gate/destination, show the existing teleport preview/VFX, and enter the stored world without creating a duplicate runtime record.
- Then connect persistent world records to world-specific creations/builds so a created world is not only a registry entry but a durable place containing its own evolving content.


## Persistent world re-entry pass — 2026-10-01

- Grid Atlas world cards now expose an ENTER WORLD action.
- Atlas accepts a world-selection callback rather than owning teleport logic, preserving the separation between world discovery UI and Grid Transit.
- main.ts now resolves the selected world to its persistent world-gate:* transit node, validates the route through GridTeleportSystem.request, shows the existing destination preview/teleport VFX, moves the avatar to the stored destination, and records a WORLD_VISIT activity with persistent/reentry metadata.
- Teleport traffic and the existing grid_teleport_events persistence path are reused; no second teleport implementation was created.
- Because GridLivingWorld determines its active world from the player's position against the world registry, arriving at the stored world coordinates naturally switches the active living-world context.
- Atlas closes before transit begins so the destination preview/VFX are unobstructed.
- Commits: 0aae73216330b97091cae1ebc32f6af30ede86e6 (Atlas entry action), e94ec240f59681bfe4912594eafad30b8536bad8 (Atlas close-before-entry), 67ee09f3af1b94f850795e1b6c3715d6e27f0e40 (persistent re-entry flow), 1f491417dca2663d024b93033ecf4a754d34cbe5 (world lookup import).
- Verification: no GitHub Actions workflow run has yet been returned for the latest code commit. Do not claim CI/build verification for this pass until a workflow reports success.
- Local typecheck/test execution was not performed.
- Draft PR #1 remains open/draft; no merge was performed.

### Current next target

- Make the persistent world's actual content durable: world-specific builds, terrain edits, placed objects, NPC/creature state, quests and discoveries should be keyed to the persistent world_id, then restored when the resident re-enters.


## Persistent world content pass — 2026-10-02

- Added durable world-content storage keyed by persistent world_id.
- Supabase now has `grid_world_content` for shared world builds, Grid Matter terrain, consequence history, NPC snapshots, creature snapshots, and metadata.
- Supabase now has `grid_world_player_state` for per-user quest/discovery progress, avoiding the mistake of treating a world's quest progress as globally shared.
- Both new tables have RLS enabled. World content is publicly readable only for enabled worlds (or the owner), while writes are owner-scoped. Player state is user-scoped.
- Added `src/social/GridWorldContentAuthority.ts` to load/save both shared world content and per-user world state.
- `GridMatterTerrainSystem` now exposes world-scoped `serializeWorld()` / `restoreWorld()`.
- `QuestSystem` now exposes `exportState()` / `importState()` so visited/interacted/discovery and quest progress can follow the resident into the correct persistent world.
- `WorldConsequenceSystem` now exposes `exportState()` / `importState()` so discoveries and living-world consequence history can survive re-entry.
- `main.ts` now tracks persistent world IDs, saves the active persistent world's builds/terrain/consequences/NPC/creature snapshots, and restores them when re-entering. Persistent-world builds are stored in `grid_world_content` rather than the special First Light collaborative build region.
- The restore loop also clears the persistent build layer when returning to a non-persistent built-in world, preventing content leakage between worlds.
- NPC/creature snapshots currently persist identity/position/selected metadata and are restored on re-entry; deeper behavioral-state hydration remains a follow-up.
- Live Supabase verification confirms both new tables exist with RLS enabled.
- Repository migration files were added for the content table, build column, and per-user player state.
- Current branch head: `9c470887cb725530f7d260ee97ae0d423f7700fc`.
- CI status: no workflow run/status has been returned yet for this head, so this pass is **not CI-verified**.
- Draft PR #1 remains open/draft; no merge performed.

### Next target

- Verify CI/build on the persistence pass.
- Then deepen NPC/creature state hydration (behavioral state, inventories, relationships, evolution state) and connect persistent world permissions so builders other than the owner can safely contribute without weakening RLS.


## Deep living-state + collaborator permissions pass — 2026-10-02

- NPC persistence now captures/restores per-world citizen runtime state plus full NPC profile data: level, XP, skills, traits, memories, occupation progression, inventory, tags, and relationships.
- NPC relationship state is restored into the existing relationship network rather than replacing the runtime network.
- Creature persistence now captures/restores per-world life state, hunger/energy/social/curiosity, position, rotation, and evolution genome/lineage data.
- `main.ts` now restores this deeper state when a resident enters a persistent world and periodically saves the active persistent world's content.
- Added `grid_world_collaborators` with `viewer`, `builder`, `editor`, and `admin` roles. Owner-only collaborator management is enforced by RLS.
- Persistent world content writes now permit builder/editor/admin collaborators while preserving the actual world owner's `owner_user_id`; a collaborator cannot silently take ownership when saving content.
- Added authority methods for reading a user's world role and owner-managed collaborator assignment/removal.
- Live Supabase migration for collaborator permissions applied successfully. RLS is active on the collaborator table and world-content write policies were upgraded for participant roles.
- Current branch head: `23c3b4a6c1a6527662e0f615db4e9c9d7b22f9c0`.
- CI has not yet returned a workflow run for this branch head, so this pass remains **not CI-verified**.

### Next target

- Run/verify CI for the persistence + collaborator pass.
- Then connect the collaborator roles to the in-world Build Mode UI so viewer/builder/editor/admin capabilities are visibly enforced before editing or publishing world content.


## Latest pass — Build Mode collaborator permissions + CI repair — 2026-10-02

### Changes made
- Fixed the TypeScript CI failure in `src/world/NPCSocietySystem.ts` by importing the existing `NPCRelationship` type from `NPCRelationshipSystem.ts`.
- Added Build Mode access roles in `src/world/GridEasyBuildSystem.ts`: owner, viewer, builder, editor, admin.
- Viewer access can open the Build panel but cannot place, edit, copy, paste, move, rotate, scale, or delete builds.
- Builder can create and edit their own build objects; editor/admin/owner can edit all build objects.
- Build Mode now exposes the current role and an explicit permission state in the UI.
- `src/main.ts` now resolves the active persistent world's collaborator role through `GridWorldContentAuthority.getRole()` and applies it to Build Mode. Non-persistent/default worlds retain local owner-level build access.
- Server-side Supabase RLS remains authoritative; the UI gating is not treated as a security boundary.

### Commits
- `d3df806f1852a930665c848292d2fb6c1d93148c` — Fix NPC relationship persistence type import.
- `cd58534370ae3926f7081b247cbc430ee69e6bdd` — Enforce collaborator roles in Grid Builder UI.
- `44b50588e8cd569490b6ae79341647dad70e6f91` — Wire world collaborator roles into Build Mode.

### Verification
- GitHub Actions run #1028 failed at TypeScript check before the import fix; the reported error was `NPCSocietySystem.ts(553,87): Cannot find name 'NPCRelationship'`.
- No completed GitHub Actions run has yet been returned for commit `44b50588e8cd569490b6ae79341647dad70e6f91`.
- Local TypeScript verification remains unavailable from the development shell.
- Draft PR #1 remains open/draft/unmerged.

### Next target
- Verify the new branch head through GitHub Actions.
- Then connect collaborator management/status more visibly to the world/social UI, and continue testing Build Mode persistence/realtime behavior across owner, viewer, builder, editor, and admin roles.


## CI repair follow-up — 2026-10-02

- GitHub Actions run #1032 for prior head `5cf05b60463f0c825538e1d628e55d097397c571` failed TypeScript compilation.
- Root cause was broader than the previously fixed import: `NPCSocietySystem.ts` had been accidentally reduced to its import section by a bad file update, removing its exported `NPCSocietySystem`, `SocietySnapshot`, and related implementation.
- Restored the complete NPC society implementation from known-good commit `23c3b4a6c1a6527662e0f615db4e9c9d7b22f9c0`, retaining the required `NPCRelationship` type import.
- Hardened strict TypeScript narrowing in role-aware Build Mode so optional selected objects are narrowed before mutation/copy operations.
- Commits:
  - `0404c65928d48e90c3062db112d3c69d51855aa2` — restore NPC society exports/persistence.
  - `ee42dd0b7ba6db346f8264c1f12855a1ac703358` — fix strict typing in role-aware Build Mode.
- Current branch head: `ee42dd0b7ba6db346f8264c1f12855a1ac703358`.
- No completed CI run has yet been returned for this new head; combined status is currently empty.
- GitHub currently reports PR #1 as open/draft/unmerged and temporarily `mergeable=false`; do not interpret that as a merge or as a verified build.
- Local TypeScript verification remains unavailable.


## Build persistence ownership hardening — 2026-10-02

- CI run #1035 completed successfully for the repaired handoff head.
- Hardened Build Mode undo: a builder can no longer undo/remove the latest restored object unless that object is actually editable by their role.
- Persistent build saves now preserve each serialized build's existing `ownerUserId` instead of replacing every build owner with the currently authenticated user. This keeps builder ownership meaningful after world re-entry and collaborator saves.
- Commits:
  - `608db50813fbedb678b9b72f7ed2f6d15c3d792d` — restrict Build Mode undo to permitted objects.
  - `883a4d2d908c886e5b698e50b79d4d9344136d40` — preserve build ownership during world persistence.
- New commits have not yet returned a completed CI result.


## World collaborator management UI — 2026-10-02

- Added persistent collaborator roster retrieval to `GridWorldContentAuthority`.
- Added a WORLD ACCESS tab to the Social panel.
- World owners can search existing Grid users, grant access, change roles between viewer/builder/editor/admin, and remove collaborators.
- Non-owners can see their current world role but cannot mutate access.
- Existing Supabase RLS remains the authoritative enforcement layer; the UI does not replace server-side permissions.
- Commits: `c04f4d46c2da35dc8627198ce02e4c33257dce96`, `d8eaab599f5d6ec4a396948dd5cd68bf95f1f8fb`, `274805bc3cc665be17c778afdb2424a2c0d66ff5`, `10f25b5644e1134706d0e95831d3e1473cc60f02`.
- CI verification is pending for this pass.


## Collaboration persistence hardening — 2026-10-01

- Verified the preceding collaborator-management head through GitHub Actions: **Grid World CI run #1042 succeeded**.
- Reviewed GridWorldContentAuthority.save() and identified a destructive authorization edge case: a builder could submit a full world snapshot and potentially overwrite other collaborators' shared builds/state despite Build Mode restricting which objects the builder could edit.
- Hardened src/social/GridWorldContentAuthority.ts:
  - owner/editor/admin retain full snapshot persistence;
  - builder persistence is merged against the authoritative current world snapshot;
  - builder-owned build records are the only shared build records a builder can replace/remove;
  - builds owned by other users are preserved;
  - terrain, quests, consequences, NPC state, creature state, and metadata are preserved from the authoritative snapshot for builders.
- Commit: a0eff078b07cf7cfcb9759a4b35ee8e2c8a7c03c.
- Verification: no GitHub Actions workflow run has been returned yet for this new commit. Do not call it CI-verified until a successful run appears.
- No merge performed; draft PR #1 remains open/draft.
- This is a defense-in-depth layer; Supabase RLS remains authoritative.

### Next target

- Verify commit a0eff078... through CI.
- Then make collaborative build synchronization/realtime behavior explicit so simultaneous builders see persisted object changes without polling the whole world snapshot.
- Preserve the same ownership boundary when realtime INSERT/UPDATE/DELETE events are introduced.
