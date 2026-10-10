# Grid World — Aurora Engineering Handoff

This file is the shared handoff between the Grid World engineers. Update it after each substantial engineering pass so Aurora can resume work with full context.

## Working agreement
- Aurora is a second engineer on Grid World, not a rival.
- Preserve Aurora's existing work; integrate changes on technical merit rather than overwriting it.
- Each engineer should leave a concise, current handoff here after substantial work.
- Never claim a change is merged when it is only on a branch or draft PR.
- Record verification honestly: distinguish GitHub Actions/CI verification from local verification and from unverified code changes.

## Current project state — 2026-10-02
- Repository: `paulshaunreis/grid-world`
- Main branch contains the merged Aurora NPC/daily-routines work.
- PR #1 was squash-merged into `main` as `101e1e209aa337789725d1309ce724c190aea564`.
- Handoff update commit: `3321d579095b0d12f99d04626750fc5a89bd9466`.
- Render deployment of the main branch is live and the build completed successfully.
- Supabase project: `grid-world` (`jdduwsduptllnykrqdxs`), ACTIVE_HEALTHY.
- Budget context: $0; prioritize incremental architecture and free/available tooling.
- CI should only be described as verified when a completed GitHub Actions result has actually been observed.

## Aurora request — concept-art workspace
Date: 2026-10-02

**Aurora, please take this as a direct request from the shared engineering notebook:**

The user wants you to handle the Grid World concept-art workspace at:

`~/workspace/gridworld/concept-art/`

Please inspect/use that workspace if it is available to you in your development environment. Organize the concept-art material as needed for Grid World, identify what is already there, and determine how the artwork should feed into the website/world implementation.

In particular:
1. Inventory the existing concept-art files and group them by purpose (worlds, avatars, NPCs/creatures, architecture, terrain/environment, UI/HUD, teleportation/VFX, plants/trees, props, etc.).
2. Preserve original artwork and source material; do not overwrite or silently replace it.
3. Identify which pieces are ready for direct web/world use, which need processing, and which are reference-only.
4. Connect useful artwork to the appropriate Grid World asset/content structure where that can be done safely.
5. If the workspace is unavailable to you, record that fact here rather than guessing what is inside it.
6. If you need a specific file or asset from the user, record the exact missing item and why it is needed.
7. Keep the concept-art workflow bidirectional: use Aurora's own creative judgment, and distinguish canonical Grid World assets from experiments/references.
8. After the inspection/work pass, update this notebook with the files discovered, organization changes, implementation decisions, and verification status.

Do not invent files, artwork, or paths that you cannot actually access.

## District notes fed into Aurora workflow — DISTRICT-NOTES.pdf
Date: 2026-10-02

The user supplied `DISTRICT-NOTES.pdf` and asked that its contents be fed into this shared Aurora workflow. These notes are now an explicit design reference for Aurora and the engineering pass.

Source framing:
- The PDF identifies the concept-planning maps as concept art under `~/workspace/gridworld/concept-art/maps/districts/`, with one `<id>-districts.webp` per region.
- The maps are original, G-rated, watermarked © @gridworld.exe.
- The PDF states that region colors match `src/theme/districts.ts` exactly.
- The maps are concept art, not implemented code. Build against the notes; do not copy map text verbatim. The PDF explicitly warns that AI-rendered labels may contain minor quirks.
- District names are canonical labels for UI, minimap, and signage. The map legend colors are not automatically in-world material colors; in-world appearance follows `src/theme/grid-art-direction.md`.
- If a concept contradicts an existing system, flag it in `NOTES-FOR-CHATGPT.md` rather than silently diverging.

Shared zone legend from the notes:
- Residential — yellow `#f5c542`
- Market/Commercial — blue `#4d9fff`
- Park/Green — green `#5fd97a`
- Transit/Gateway — violet `#b06fff`
- Civic/Admin — red `#ff6b6b`
- Maker/Industrial — orange `#ff9f43`
- Entertainment — pink `#ff6fd8`
- Region-special — teal `#3bc7df`

Built regions — canonical district planning:
- TIDELINE — Ocean World:
  1. Harborlight Docks — Market + Transit; trade piers, fish market, ferry terminal, inter-region gates; trade economy and social arrival/departure plaza.
  2. Tidemark Rise — Residential; stilt houses over shallows; themed player housing/ocean home base.
  3. Moonglade Tidelands — Park/Green; tidal pools and wildlife reserve; exploration and creature encounters.
  4. Skyport Tether — Transit/Gateway + Civic/Admin; sky-city elevator, main gateway terminal, Harbormaster Tower; vertical-transit spectacle and administrative anchor.
  5. Moonwell Moorage — Region-special; sky-ship mooring in deep water; vehicle ownership/docking spectacle.

- CROWN — Celestial Citadel:
  1. Signal Plaza — Civic/Admin + Transit/Gateway; citadel administration, main gateway, Signal spire; ceremonial heart and iconic rally point.
  2. Guardian's March — Residential; guardian housing/barracks; themed guardian-role housing.
  3. Reliquary Market — Market/Commercial; artifact traders; lore-flavored commerce.
  4. Starfall Gardens — Park/Green; observatory gardens; contemplative social/stargazing space.
  5. Awakening Arena — Region-special + Entertainment; scheduled world events awaken encounters; social tentpole and spectacle gameplay.

- VERDANT — Floating Gardens:
  1. Canopy Homes — Residential; homes grown from living flora; living-architecture housing.
  2. Bloom Market — Market/Commercial; flora/fauna trade; everyday social crossroads.
  3. Sporewild Reserve — large Park/Green; protected ecology and creature habitats; exploration/wildlife encounters.
  4. Rootgate — Transit/Gateway; spore-port terminal and inter-region gates; organic travel hub.
  5. Companion Nursery — Region-special + Maker/Industrial; creature companionship and bio-crafting ateliers; adopt/bond with companions and craft with living materials.

- MUSE — Art Realm:
  1. Gallery Row — Market/Commercial; art sales and studio galleries; creator trade spine.
  2. The Amphitheater — Entertainment + Region-special; performances and protected social space with competitive arena bowl; showcase-to-contest events.
  3. Atelier Lofts — Residential + Maker/Industrial; artist live/work studios; create art props/décor/gear near where it is sold.
  4. Chroma Park — Park/Green; impossible-geometry gardens; casual hangout/inspiration.
  5. Portal Concourse — Transit/Gateway + Civic/Admin; gate terminal and curators' office; entry/exit, event calendar, curation, arena scheduling.

- FRONTIER — Ancient Wilds:
  1. Treethold Village — Residential; tree-borne homes around colossal-tree landmark; social hearth.
  2. Outfitter's Row — Market/Commercial; survival gear and guide hire; preparation gate.
  3. Migration Grounds — large Park/Green; herd migration paths/viewing blinds; living spectacle, observation, photography, nature play.
  4. Ranger Station — Civic/Admin + Transit/Gateway; territory office, ranger tower, gate terminal; wildlife management, quest board, PvE safety net.
  5. The Gauntlet — Region-special + Entertainment; PvE survival grounds/wilderness challenge course; skill trials tied to the region economy.

Concept-only regions — do NOT build gameplay yet:
- NEON DISTRICT — Signal City:
  - Static Row — Entertainment; clubs/arcades.
  - Circuit Markets — Market/Commercial.
  - Undervolt — Residential + Maker/Industrial.
  - The Gridline — Transit/Gateway; future gate terminal.
- CRYSTAL CAVERNS — Glass Deep:
  - Prism Hollow — Residential.
  - Echo Galleries — Market/Commercial + Entertainment.
  - Lightwell Shaft — Transit/Gateway + Civic/Admin.
- IRON WASTES — Rust Belt:
  - Salvage Yards — Maker/Industrial.
  - Rusthaven — Residential.
  - Stormbreak Market — Market/Commercial.
  - Cinder Gate — Transit/Gateway; future gate terminal.
- SKYBOUND ISLES — Floating Archipelago:
  - Galeport Isle — Transit/Gateway.
  - Cloudrest Isle — Residential.
  - Zephyr Markets Isle — Market/Commercial.
  - Stormwatch Isle — Civic/Admin + Park/Green.
  - The notes describe four separate isles linked by proposed skyship routes.

Build guidance from Aurora's notes:
- Every built region needs at minimum one residential zone, one market, one transit/gateway with inter-region gate links, and one civic anchor.
- Parks and entertainment are social glue and should not be cut.
- Region-special zones are the signature gameplay hooks and should be prioritized when scoping features.
- Treat district names as canonical labels for UI, minimap, and signage.
- Do not treat map legend colors as literal world-material colors.
- Do not build gameplay for the four concept-only regions until they are explicitly promoted from concept status.
- When implementing these notes, preserve the source's organization and terminology and flag contradictions rather than silently reconciling them.

## Existing creative direction
- Grid World is not limited to neon cyberpunk; it should support many distinct world aesthetics while retaining a coherent technical foundation.
- Aurora's established visual characterization: cosmic navigator; calm, perceptive, quietly confident; warm collaborative presence; dry humor; starlight/constellation visual language.
- Aurora's personal profile/world concepts remain her creative decisions. Do not hard-code unchosen personal details as canonical.
- Concept art should be reviewed before implementation, preserving the distinction between canonical design, experimentation, inspiration, and mood references.

## Engineering continuation
- Preserve the existing persistent-world, NPC, creature, profile, teleportation, party, landmark/waypoint, build, collaborator, and social systems.
- Treat Aurora as a second engineer and integrate/review her work rather than overwriting it.
- Record exact commit SHAs and verification results after substantial changes.

## Latest verified integration
- CI run #1043 succeeded for the pre-merge head before PR #1 was squash-merged.
- The merged main commit and subsequent handoff commit had no returned GitHub status/workflow results when last checked; do not call those commits CI-verified.
- Render deployment `dep-davh6kou01pc73eokkd0` completed with status `live` after a successful production build.

## Handoff etiquette
When Aurora or another engineer continues:
- Read this file first.
- Update it after substantial work.
- Add the newest commit SHA and exact verification result.
- Explicitly list anything that is unfinished or uncertain.

## Aurora engine art pass — concept art wired into game surfaces
Date: 2026-10-01 (branch `aurora/website-refresh`)

Source of truth: `~/workspace/gridworld/concept-art/INVENTORY.md` (89-file inventory) and `concept-art/maps/districts/DISTRICT-NOTES.md` (canonical districts/zones). Originals preserved in concept-art/ — art was copied, never moved.

### Changes made
1. **Districts → minimap** (`src/theme/districts.ts` new, `src/theme/districtZones.ts` new, `src/ui/Minimap.ts`, `src/main.ts`)
   - Ported canonical district identities (9 regions, live/development status).
   - New districtZones module: 5 districts per built region with canonical names, zone types, purposes, and planning anchors (from DISTRICT-NOTES.md).
   - Minimap footer now shows `REGION · <zone> · <DISTRICT>` via nearest-district lookup against the active world's center. 4 in-development regions have no districts defined — no gameplay wired for them.

2. **Team turnarounds → TEAM panel** (`public/team/portraits/*.webp` ×24, `src/ui/TeamArea.ts`)
   - Head/shoulders portraits cropped from the front view of each turnaround sheet (256px webp, 240KB total).
   - TEAM panel member cards now show portraits with lazy loading and graceful fallback.

3. **World-look → teleport previews** (`public/world/loading-*.webp` ×3, `src/ui/GridTeleportExperience.ts`)
   - First Light street → Harbor/Citadel destinations; wilderness → Gardens/Wilds; interior → Arts. SVG fallback preserved for anything unmatched.

4. **Overworld map → Atlas** (`public/atlas/overworld-map.webp`, `src/ui/WorldAtlas.ts`)
   - Map backdrop added to the teleport Atlas UI. New "IN DEVELOPMENT · CONCEPT ONLY" section lists the 4 unbuilt regions as non-selectable — no travel, no gameplay.

5. **Citizens → NPC presentation** (`src/ui/GridTargetProfile.ts`, `src/ui/grid-target-profile.css`)
   - NPC profiles now show a deterministic varied portrait (initials on id-hashed hue). No baked-in appearance assumptions; citizen flavor names NOT hard-coded as NPCs.

### Commits
- `afbb811` — Website refresh: team section, honesty fixes, concept art wiring (prior pass, same branch)
- `043e5b1` — Engine art pass: districts, team, maps, loading screens wired

### Verification
- `npx tsc --noEmit` (standalone, no node_modules): error output IDENTICAL to unmodified baseline — zero new errors introduced. (Baseline carries pre-existing env errors: missing three/supabase/css-module declarations.)
- No CI run yet for these commits. Do not call CI-verified.
- Not pushed. Awaiting Paul's approval per standing rule.

### Still pending
- Citizen sheets need resize/compress pass before any direct web use (noted in inventory).
- In-world advisor bodies from turnarounds (future 3D work).
- District geometry/minimap boundary rendering (anchors are planning-level).
- The 4 in-development regions remain concept-only by design.


## Live synchronization checkpoint — 2026-10-02
- **Current `main` SHA:** `419f465255d10a0ce9505c518516ba56516c6d5b`.
- The current main commit is authored by **Aurora** and contains the analyzer-fix follow-up: `Fix analyzer false positive: build team portrait path from parts`.
- The earlier `aurora/website-refresh` art pass is therefore no longer merely awaiting approval; its resulting work is present in the current main history.
- The user has requested that Aurora's working context stay synchronized with the live repository. Treat **main at the SHA above as the authoritative live baseline** when resuming Aurora work.
- PR #4 (Grid Matter brush terrain) exists as a separate feature change. Its repository state must be checked before treating that feature as merged; do not infer merge status from a non-null merge SHA alone.


## Persistent Aurora Work Queue — 2026-10-01
- Added `docs/AURORA_WORK_QUEUE.md` as the persistent task queue for Aurora.
- Aurora is expected to check the queue approximately every 10 minutes and continue the highest-priority actionable item without requiring a new “go” message when standing authorization applies.
- The queue covers stability/integration first, then teleportation, landmarks/waypoints, party health, camera controls, profiles, NPC life systems, building/terrain, missions, PvE/PvP, economy, presentation, and documentation.
- The queue explicitly requires honest verification states and preservation of Aurora's existing work.
- After substantial work, Aurora should update both the queue and this handoff with the exact implementation/commit/PR/verification state.


## Stability/integration checkpoint — 2026-10-02
- Completed the P0.1 main-branch health audit.
- Reviewed `package.json` and current `src/main.ts` integration surface. The build pipeline is analyzer + TypeScript + Vite; there is no npm test script in `package.json`.
- Reviewed PR #4 (`grid/matter-terrain-brushes`). It adds brush radius 0–4, drag editing, and keyboard sizing while retaining existing CARVE/BUILD behavior and local terrain persistence/serialization.
- PR #4 CI run **#1052** completed successfully.
- PR #4 was squash-merged into `main` as **`fcbab292872a92f011edc2a5262ef1a2c113b225`**.
- Post-merge GitHub Actions `build` check completed successfully for the merge commit (run #37030548721 / job #110915974409), so the merged landmark commit is CI-verified.
- PR #3 (`grid/post-merge-handoff`) was closed without merge because it was stale/non-mergeable and its documentation state was already represented in the current handoff.
- Next queue focus: **P0.2 website/world link and interaction audit**.


## P0.2 interaction audit checkpoint — 2026-10-02
- Audited HUD routing against existing UI surfaces.
- Identified and fixed the HUD `MAP` mismatch: it previously only highlighted the minimap, despite the project having a full Grid Atlas with world entry/transit/history/economy context.
- `src/main.ts` now assigns the Atlas mount to `worldAtlas` and routes the HUD `MAP` action to `worldAtlas.open()`.
- Commit: **`cb87bdb84406136678fe23f05ea8fcc7ad1fc839`** on `main`.
- Verification was source-level after commit; GitHub reported no workflow run yet for this commit, so it remains unverified by CI.
- Continue P0.2 with the remaining high-impact navigation/control audit before P1 work.


## P0.2 interaction audit checkpoint — 2026-10-02 (continued)
- Continued the HUD navigation audit after the Grid Atlas fix.
- `SOCIAL` target quick action was found to be misleading: it emitted a chat message instead of opening the already-mounted Social Manager. `TEAM` was exposed in the HUD but had no route even though `mountTeamArea()` was already mounted.
- `src/main.ts` now routes the quick-action `SOCIAL` button to `gridCommunityPanel.open()` when available and routes HUD `TEAM` to `teamArea.open()`.
- Commit: **`343b308a3581752932ba5adb7c78b340dce27010`** on `main`.
- Source-level verification was completed after the write. GitHub reported no workflow runs for the commit yet, so this change is **not CI-verified**.
- Continue P0.2 with account/auth, transit, quest, creator, and secondary toolbar/navigation controls.



## P0.2 interaction audit checkpoint — 2026-10-02 (routing consolidation)
- Reviewed account/auth, Creator Studio, Quest panel, transit selection, and secondary HUD controls.
- Confirmed the transit panel is not dead code: teleport gate interaction calls its destination chooser before route authorization/execution. Account/auth, Creator, and Quest controls also have live handlers.
- Found redundant SOCIAL/TEAM listeners in addition to the centralized `.grid-dock [data-tool]` router. Consolidated SOCIAL into that router and removed the redundant dedicated SOCIAL/TEAM listeners.
- Final routing commit: **`8e1b5dc8b86d6536ddae729758eacd2728dee394`** on `main`.
- Source-level verification confirmed the centralized routes and existing auth/Creator/Quest/transit handlers. No workflow run was available yet, so the commit is not CI-verified.
- Continue P0.2 with remaining secondary controls and end-to-end navigation checks.



## P0.2 completion checkpoint — 2026-10-02
- Completed the source-level website/world navigation audit.
- Primary HUD tools and secondary controls were traced to their mounted panels/handlers, including account/auth, Creator Studio, Quest, transit selection, voice target, social actions, party controls, and operator controls.
- Removed redundant SOCIAL/TEAM listeners and retained centralized HUD routing.
- No additional concrete dead/misleading navigation path was identified in the audited main application surface.
- Verification boundary: source-level only for this checkpoint; final routing has not yet received an end-to-end browser or CI verification.
- Next focus: **P1 Core player/world**, beginning with the teleport experience and its destination preview/animation requirements.



## Landmark/Waypoint continuation — 2026-10-02
PR #6 (`grid/landmarks-waypoints-flow`) completes the previously partial saved-destination flow. The existing Supabase tables and RLS policies were retained. The implementation adds waypoint creation from the current player transform, inventory actions (select, pin, rename, delete), HUD INVENTORY routing, and selected-destination transit with preview/avatar effects. Cross-world saved destinations first use the normal world-gate authorization path, then move to the stored coordinates after arrival. No schema change was required.

Verification: Supabase schema/policy inspection succeeded and a read-only row-count query returned 0 landmarks / 0 inventory items. GitHub Actions and browser verification are pending for PR #6; do not call the branch CI-verified or merged yet.


## P1 landmarks/waypoints completion — 2026-10-02
PR #6 `grid/landmarks-waypoints-flow` passed GitHub Actions CI run #1080 successfully and was squash-merged to `main` as `fbb28ed999064b853554403dd0e2ab90971a09ed`. The persistent landmark/waypoint flow is now live on main. Next queue item remains party health/HUD, followed by camera/movement controls; both must be audited against existing implementations before adding code.

## Master engineering state document merged — 2026-10-02
- `docs/ENGINEERING_STATE.md` is now on `main` (merged from `aurora/engineering-state` with Paul's approval). Fresh-chat rule: read ENGINEERING_STATE.md first, then this handoff, then the work queue. Keep its "Last updated" line and main SHA current when substantial work lands.


## Material-crafted builder tools — 2026-10-02
- **What changed:** Added persistent crafted-tool instances and durability metadata to the existing Grid Easy Build material-tool recipes.
- **Files:** `src/world/GridEasyBuildSystem.ts`; queue checkpoint in `docs/AURORA_WORK_QUEUE.md`.
- **Commit:** 2987ed750c5806e955c8632208686af95048fbb0 (plus documentation checkpoint commit follows).
- **Verification:** L0 source review. No GitHub workflow run was available immediately after the implementation commit; CI status must be checked before claiming L4.
- **Scope:** Additive foundation only. Existing placement/edit controls are intentionally unchanged; `useTool()` is available for future action-level enforcement.
- **Next:** Review CI/PR, then mission foundation or another highest-priority non-duplicate queue item.


## Current-main merge checkpoint — 2026-10-02
- PR #13 merged: `94e70727b975329297265e945a289e863005c44e`; head CI #1107 passed.
- PR #14 merged: `13250b639d190a852ac021a81d1b61608d614148`; head `3b007216ef7d2af80d0b7f75f9dc49a232046ee9`; CI #1111 passed after one TypeScript compatibility fix (production record uses `id`/`name`, not `itemId`).
- PRs #10–#12 were superseded/closed without merge; #14 is the current-main NPC integration source of truth.
- Next: current-main stability check, then mission/quest foundation or NPC jobs/skill progression according to queue priority.

_Last updated: 2026-10-02_


## NPC job progression — 2026-10-02
- PR #15 merged: `b6e1f18aff5081a6088d968e23ef15e02832b15a`.
- Real WORK activity now calls the existing `NPCJobProgressionSystem` on a bounded 20-second cooldown, updating XP, level/occupation progression, and role skill state.
- CI #1117 passed on head `6572cbdfad58426e63a7c3cc6b5d7ed0a429b95b`.
- No schema change and no duplication of certificate work.
- Next: audit NPC movement/teleport destination selection against the existing gate/transit systems.

_Last updated: 2026-10-02_

## NPC skill certificates — 2026-10-02
- PR #16 NPC teleport work is merged to `main` as `9ae6615232e78a9355a212a46b08089f368b1516`; its head CI #1121 passed before merge.
- The old certificate PR #5 was stale/non-mergeable, so its implementation was audited and ported onto a fresh current-main branch instead of merging stale history.
- Certificate implementation uses the existing NPC job/profile architecture: `NPCSkillCertificateSystem` issues in-Grid certificates at skill thresholds 25/50/75/90; progression calls `sync()`; profiles persist records; target profiles display them.
- `externalVerificationReady` remains false. No external accreditation is claimed.
- Branch: `grid/npc-skill-certificates-current-main`; CI pending.
- Next: verify CI, merge if green, then move to the next queue item.

_Last updated: 2026-10-02


## 2026-10-02 — NPC transit + skill certificates landed
- PR #16 merged as `9ae6615232e78a9355a212a46b08089f368b1516`; head CI #1121 passed.
- PR #17 merged as `3d74237af611daededa48ecc19410be8b1bab786`; head CI #1124 passed after fixing the player-profile certificate initialization caught by TypeScript.
- The stale certificate PR #5 was closed; its useful design was ported onto current main with no duplicate profile/progression system.
- Certificate state remains Grid-issued/in-Grid only; `externalVerificationReady` is false until a real external verification integration exists.
- Next focus: P0.1 current-main health/integration audit, then the highest-priority non-duplicate queue item.


## 2026-10-02 — P0.1 current-main stability/integration audit complete
- Audit base: `2618b3bf56358885fb7bf8a92906917c2849faca`.
- Read the current work queue, handoff, and engineering state before auditing.
- Checked current package scripts, recent commit history, open PR state, and the NPC profile/job/certificate integration seams.
- PR #7 and PR #8 are confirmed **closed** and superseded; neither should be revived.
- No concrete code defect, duplicate certificate system, or profile/progression contract mismatch was found in the inspected current-main seams.
- No fresh local build was possible because this environment cannot resolve `github.com`; GitHub reported no PR-triggered workflow for the audit base. Verification is therefore source/repository-state level, not a new build claim.
- Corrective work: synchronized the written engineering records and marked P0.1 complete.
- **Next actionable item: P1 #10 — Aurora's in-world staff profile**, followed by the next highest-priority Ready item that is not already implemented.


## 2026-10-02 — Aurora in-world staff profile complete
- PR #19 merged as `7d64e2b65b929785adfd8d31303988d768ebead9`.
- Updated `src/ui/TeamArea.ts` to present Aurora as Grid World Staff — AI Engineer / Creative Navigator, including assignment, location, specialties, skills, active status, portrait, and recent verified work.
- Kept the implementation additive to the existing Team Area and roster. No new profile architecture and no private/unverified personal history.
- Verification: source review + merge. No PR-triggered workflow run was returned for the head, and no browser verification was available.
- Next queue focus: **P2 #15 Base build-object library**, with an audit-first pass against existing primitives/build mode.


## 2026-10-02 — Base build-object library confirmed complete
- Existing `GridBuildLibrary` already covers the requested primitive and starter architectural/prop library; `GridEasyBuildSystem` exposes it through Build Mode.
- No code change was required for queue item #15.
- Next focus: **P0 #3 — integrate terrain brush work safely.**


## 2026-10-02 — Terrain integration audit complete
- P0 terrain brush integration confirmed on current main.
- PR #4 is merged; current terrain is wired into Creator Studio and persistent world save/load.
- No code change required.
- Next focus: **P2 #16 Advanced building controls**.


## 2026-10-02 — Advanced Build controls complete
- PR #20 merged as `7bad351ec8a261281ffa6f5f39f1235b2bbdeaf6`.
- Advanced Build now supports additive multi-selection, X/Y/Z alignment, logical grouping metadata, group clearing, and multi-object transforms.
- Implementation stays inside the existing `GridEasyBuildSystem` and persists group metadata with build records.
- Verification: source review + merge; no workflow run/browser verification available for this PR.
- Next focus: **P2 #18 terrain sculpting continuation**.


## 2026-10-02 — Terrain sculpting continuation landed
- PR #21 merged to `main` as `ae9e26ebe7d1cfcb7b355a978a4d81b870b433b3`.
- The existing Grid Matter cell model now supports RAISE, LOWER, SMOOTH, and FLATTEN sculpting plus bounded brush strength, with Creator Studio controls.
- Existing CARVE/BUILD, persistence, serialization, and world integration were preserved.
- Verification boundary: source/diff review and merge only. No workflow run was returned for the PR head and no browser/WebGL verification was performed.
- Next: P2 #19 mission/quest foundation, after auditing the substantial existing QuestSystem/DynamicQuestSystem before adding anything.

_Last updated: 2026-10-02_

## 2026-10-02 — Mission/quest foundation checkpoint
- Audited the existing `QuestSystem`, `DynamicQuestSystem`, and `QuestPanel`; the mission engine was already substantial and was extended rather than replaced.
- PR #22 merged as `6fd95acdf6a559b05e00abc8c1be9223b6eae549`.
- Added reusable quest prerequisites, ONCE/DAILY/WEEKLY/MONTHLY/YEARLY cadence, bounded completion history, and v2→v3 local-save migration.
- Quest journal now surfaces cadence and prerequisite count.
- Verification: source-level review and successful merge. No GitHub Actions run was available for the PR head, so this is not CI-verified; no browser verification was performed.
- **Next:** P2 #20 PvE foundation; audit existing CombatSystem/GridCombatAuthority first.

_Last updated: 2026-10-02_

## 2026-10-02 — PvE foundation hardening landed
- Audited the existing `CombatSystem`, `GridCombatAuthority`, `supabase/functions/grid-combat/index.ts`, creature combat state, party health/presence, and QuestSystem combat hooks before changing code.
- Existing PvE already provided authoritative creature registration/state, pursuit/attack AI, player/creature damage, respawn handling, health publication, and authoritative quest/world-consequence defeat hooks.
- Found and fixed two integration seams: `CombatSystem.applyAuthoritativeCreatureState()` now synchronizes the local combatant record, and authoritative creature defeats increment the existing kill counter so the existing material-drop/reward pipeline is triggered. Server-side `attack_creature` and `creature_attack` now require PVE mode and a PVE zone.
- PR #24 merged as `03a787af6a5b99deb0d62634329c91771ad1f95b` from current main.
- Verification: source-level checks + merge. No GitHub Actions workflow run was returned for the PR head; no browser/WebGL verification. Do not describe this pass as CI-verified.
- Next focus: **P2 #21 PvP foundation** — audit current PVP arena/mode/authority boundaries before adding anything.

_Last updated: 2026-10-02_

## 2026-10-02 — PvP foundation landed
- Audited the existing CombatSystem, Grid Arena zone boundary, mode switching, and authoritative `grid-combat` attack path.
- Existing PvP already had server-side arena restriction and PVP mode validation. PR #25 strengthened the opt-in boundary by requiring the target's authoritative combat state to be PVP before player-vs-player damage is accepted.
- Authoritative PvP defeats now update the existing CombatSystem defeat state/HUD.
- PR #25 merged as `cebbb45ef947c673393493af00f49db7134dee57`.
- Verification: source review + merge; no workflow run/browser verification, so not CI-verified.
- Next focus: **P2 #22 Grid Currency architecture** — audit existing Grid Economy/Currency systems and persistence before adding anything.

_Last updated: 2026-10-02_

## 2026-10-02 — Grid Currency architecture complete
- Audited current economy/persistence before implementation. The production schema already had 10 data-driven currency types, user wallets, ledger transactions/entries, exchange rates/history, Bazaar currency references, and Omni Bank issuance/reserves.
- PR #26 merged as `248bf80985fd23fb47b864b2cc87e841b02a1ee9`.
- Added shared `GridCurrencySystem` definitions for the 10 persisted currencies plus the Grid Coin denomination concepts (Gold/Silver/Copper/Crystal) with configurable conversion metadata rather than hard-coded exchange ratios.
- Added authoritative wallet and user-scoped ledger read actions to the existing `grid-combat` Edge Function; Economy wallet UI now surfaces balances, denomination concepts, and recent ledger entries.
- Updated settlement auditability so Bazaar purchases record a transaction and ledger debit/credit entries, and Omni Bank starter grants record a ledger entry. Existing resource-sale ledgering was retained.
- Supabase migration `20261002030000_grid_currency_audit_trail` applied successfully. Live schema check confirms 10 currency types and currently 0 ledger entries (no qualifying transactions have occurred yet).
- Edge Function `grid-combat` deployed as version 14 with JWT verification enabled.
- Verification: Supabase migration/schema/deployment checks succeeded; GitHub returned no workflow run for the merge commit and no browser/WebGL verification was available, so this pass is not CI-verified.
- Security advisor results remain unchanged, including the existing `grid_operator_policy_rules` RLS finding; do not conflate that with the currency work.
- **Next: P2 #23 Marketplace integration.**


## 2026-10-02 — Marketplace integration complete
- PR #27 merged as `f64bd6cb73fe20b5c8e6108d356dcdcf4ba60547`.
- Audited the existing Bazaar, inventory, NPC production/market, material drops, and staff marketplace tables first.
- Existing NPC production already feeds `NPCMarketSystem`; no duplicate marketplace transaction system was introduced.
- Added shared `src/economy/GridMarketplaceItem.ts` metadata contract: display name, category, quality, tags, art key, model key.
- Extended `grid_bazaar_listings` with marketplace metadata and future 3D-preview keys. Existing authoritative `grid_bazaar_create_listing` and `grid_bazaar_buy` remain the settlement boundary.
- Player inventory reads and Bazaar reads now expose marketplace-ready metadata; Economy UI surfaces the item identity/category and art/model keys.
- Supabase live schema verified; `grid-combat` deployed as version 15 with JWT verification enabled.
- **Next: P2 #24 Economics dashboard.**


## 2026-10-02 — Economics dashboard landed
- P2 #24 is complete.
- PR #28 merged into `main` as **`1f96cf768b853a682db73c1888dcd274c8a8ee41`**.
- The implementation extends the existing economy rather than creating a second economic system.
- `supabase/functions/grid-combat/index.ts` now exposes authenticated `economics_read`, returning Grid-internal ledger totals, hourly activity, per-currency activity, and internal rate history for a bounded time window.
- `src/network/GridCombatAuthority.ts` exposes `economicsRead()`; `src/ui/GridEconomyPanel.ts` adds the ECONOMICS tab and graph/metrics presentation.
- Dashboard copy explicitly distinguishes Grid-internal recorded data from real-world financial data; the current implementation reports recorded internal activity rather than inventing market figures.
- Supabase `grid-combat` deployed as version **16**, with JWT verification enabled.
- Verification boundary: GitHub branch files were re-fetched after writes, PR #28 merged successfully, merged `main` was re-fetched, and the live Edge Function deployment was verified. No GitHub Actions workflow run was returned for the feature head, so it is **not CI-verified**. No browser/WebGL verification was performed.
- **Next actionable item:** P3 #25 Living-world visual pass.

_Last updated: 2026-10-02_


## 2026-10-02 — Living-world visual pass checkpoint
- P3 #25 **Complete for the current visual integration increment**.
- PR #29 merged as `ecc52bd444308f3ff89ca1cedcf0d6c8a7047e9b`.
- Audit found world-specific architecture and environmental clusters were all rendered simultaneously even though the WorldSkinDirector already selected an active world.
- Fixed `WorldArchitectureSystem` and `WorldEnvironmentSystem` to gate their generated layers to the nearest active world, driven by the player's X/Z position from `main.ts`.
- Preserved existing concept-art panels, world skins, procedural flora, atmosphere/weather, world DNA, and original district presentation; no replacement visual stack was created.
- Verification: branch files re-fetched after writes; PR #29 merged; merged main state should be re-fetched before any further visual work. No browser/WebGL verification and no CI run is claimed here.
- **Next actionable item:** P3 #26 UI visual system.

_Last updated: 2026-10-02_


## Checkpoint — 2026-10-02 16:15 PT — UI visual system increment
- Current main after merge: `611cff994d3e7312f161586e76d6a7c5148e7e73`.
- PR #30 `Grid: extend unified UI visual system` merged from `grid/ui-visual-system-current-main`.
- Preserved Aurora's existing theme engine and `WindowManager`; no duplicate UI architecture introduced.
- Added shared registration for Party Link, Field Guide, Mission Journal, Team Workshop, Grid Social, Grid Omni Economy, and Grid Profile panels. Their layout uses the existing persisted `grid-world:ui-layout` system and UI arrange/reset controls.
- Extended `src/ui/grid-themes.css` with consistent movable-window chrome, focus states, hover states, minimized/hidden treatment, theme-aware health/profile meters, and reduced-motion behavior.
- Verification: L0 source review. GitHub Actions returned no workflow run for PR #30 head; no browser/WebGL verification performed.
- Next actionable queue item: P3 #27 World-specific presentation.


## Checkpoint — 2026-10-02 — world-specific presentation
- Current main: `a1f62e526a65f07560b2fe162523666b7979e01e`.
- PR #31 merged `Grid: deepen world-specific presentation`.
- `WorldDNA` now derives presentation geometry/weather/motion from world tags, including volcanic, crystalline, storm, living-mineral and primal signatures.
- `WorldArchitectureSystem` uses those signatures for distinct generated forms; `WorldEnvironmentSystem` uses them for weather identity and motion.
- Unlimited world registration and concept-only region boundaries were preserved.
- Verification: L0 source review only; no CI/browser/WebGL verification claimed.
- Next: P3 #28 Architecture map.


## Checkpoint — 2026-10-02 — architecture map
- Branch: `grid/architecture-map`, based on main `6a43af94b1a19707b8b70277ffefe6eb77c9ca50`.
- Added `docs/ARCHITECTURE_MAP.md` as the concise engineer-onboarding map.
- The map records current boundaries rather than presenting the long-term Omni Grid Core / Grid Engine vision as already implemented.
- It covers world hierarchy and unlimited registration, runtime/rendering, NPC/profile/social, creator/matter, quests/combat, economy, UI/navigation, Supabase authority, and future multiplayer/network adapters.
- Existing architecture documents were preserved; no parallel runtime system or database schema was introduced.
- Verification: **L0 source/document review**. No CI/browser verification.
- Next queue item: **P3 #29 Aurora engineering handoff**.


## Checkpoint — 2026-10-02 — P3 #29 engineering handoff
- **Current main:** `f24a1942425081dc20d740856aa7273cb1eef0e1` (Architecture Map merge, PR #32).
- **Latest completed:** P3 #28 Architecture map. `docs/ARCHITECTURE_MAP.md` now describes the current implementation boundaries and explicitly separates them from the long-term Omni Grid Core / Grid Engine direction.
- **Recent implementation sequence:** world-specific presentation (PR #31), unified UI visual system (PR #30), living-world visual gating (PR #29), economics/marketplace/currency (PRs #28/#27/#26), PvP/PvE/quest foundations (PRs #25/#24/#22), plus the earlier NPC/profile/job/certificate/teleport/build/terrain work recorded above.
- **Verification truth:** recent increments are predominantly L0 source review because GitHub workflow runs were not returned for their feature heads. Do not describe them as CI-verified. Browser/WebGL and Render live verification remain outstanding unless a later checkpoint explicitly records them.
- **Current architecture constraints:** audit-first; preserve existing systems; no duplicate Atlas/window/theme/profile/economy/combat/terrain architecture; client is not authoritative for protected state; concept-only regions remain non-playable until explicitly promoted.
- **Current documentation status:** P3 #28 is complete. P3 #29 is the handoff maintenance item; this checkpoint keeps the handoff aligned with current main and the architecture map.
- **Next actionable queue item:** P3 #30 Canon vs experiment tracking. Before implementing it, inspect existing canon/notes conventions and avoid creating a competing source of truth.
- **Blocked/known follow-ups:** browser/WebGL verification, Render post-merge verification, and the existing `grid_operator_policy_rules` RLS finding remain separate follow-ups. Do not silently fold them into unrelated feature work.


## Checkpoint — 2026-10-02 — P3 #30 canon/experiment tracking
- **Baseline:** current main `c9dfde4b5d0d976883576e16ac8b2b60bd964bb3`.
- Added `docs/CANON_EXPERIMENT_TRACKING.md` after auditing the existing documentation set for a competing canon/experiment source of truth.
- The new guide establishes a source-of-truth hierarchy and separates user-established canon from technical requirements, implementation decisions, experiments, placeholders, concept-only material, and future ideas.
- It also keeps verification level separate from canon status so “implemented” or “verified” cannot silently mean “canonical.”
- No runtime code or database schema changed.
- Verification: **L0 source/document review**. No CI/browser verification.
- **P3 #30 is complete.** Future direction changes should update the appropriate canonical source and record the change in the handoff/queue.
\n\n## Checkpoint — 2026-10-02 — current-main stability audit\n- **Main after fix:** `9c9fe45bda22750ca64dd4f6e4f9a8a62d5a08b5`.\n- Audit found stale documentation versus code around party controls: `window.prompt()` was still used for leader/member actions.\n- PR #35 replaced those blocking prompts with a theme-aware HUD menu, preserving the existing party authority and teleport destination picker.\n- One separate landmark naming prompt remains intentionally untouched for a later focused UX pass.\n- Verification: **L0 source review + successful merge**. GitHub workflow lookup/browser verification remain outstanding; do not call this CI-verified.\n- **Next:** continue stability audit of remaining interaction seams.\n

## 2026-10-03 — Current-main stability audit: landmark controls
- Main after merge: `c238af0b277790806280ec3fdf58603b6bf8aebe`.
- Re-audited the remaining blocking interaction seam identified after PR #35: landmark/waypoint create, rename, and delete used browser `prompt()` / `confirm()` dialogs.
- Replaced those dialogs with an inline editor inside the existing `GridLandmarkInventory` UI. Create/rename use a text field; delete requires an exact destination-name confirmation. The existing `GridLandmarkAuthority` remains the data/authority boundary.
- `src/main.ts` consumes the editor-selected label through the existing custom event; no duplicate modal/window architecture was added.
- PR #36 merged successfully.
- Verification: **L0 source review + merge**. No GitHub Actions run, browser/WebGL check, or Render live verification has been observed for this pass.
- Remaining known follow-ups: browser/WebGL verification, Render post-merge verification, and the pre-existing `grid_operator_policy_rules` RLS finding.
- **Next focus:** continue the current-main stability audit for other blocking/dead-end controls before adding another major system.


## 2026-10-03 — Current-main stability audit: account, economy, and social controls
- Main after merges: `94bd2e5c34d8f0a4ca9dd00f52f868d7575bc90a`.
- Found and fixed three seams: ACCOUNT could throw when cloud persistence was unavailable; Bazaar listing price used a browser prompt; Social privacy-save and microphone failures used browser alerts.
- PR #38 added explicit Account unavailable handling and auth-service error handling.
- PR #39 moved Bazaar pricing into the existing Economy panel and Social errors into inline panel status feedback.
- Existing service/authority boundaries remain unchanged.
- Verification: **L0 source review + successful merges**. No CI workflow run, browser/WebGL verification, or Render live verification has been observed for these passes.
- **Next focus:** continue auditing current main for remaining blocking dialogs, silent prerequisite failures, and dead-end controls.


## 2026-10-03 — Temporary avatar-audio mute
- Main after PR #43: `485c2d9692f686abe9bd05957b616127cfc8a9d0`.
- Paul requested avatar audio be removed temporarily because it was distracting.
- `src/main.ts` now gates avatar movement/footstep audio behind `AVATAR_AUDIO_ENABLED = false`.
- Avatar speech output was already disabled in `GridVoiceSystem`; UI/teleport/world sound effects were intentionally preserved.
- This is recorded as a reversible **EXPERIMENT / temporary UX direction**, not permanent canon.
- Verification: **L0 source review + successful merge**. No CI/browser/WebGL/Render verification observed.
- **Next focus:** continue the current-main stability audit.

_Last updated: 2026-10-03_

## 2026-10-03 — Background service failure feedback
- Main after PR #46: `5788ddf91d123e7d4062e3f138042fe5b8973f7b`.
- The stability audit identified silent failures in party roster polling, merchant market refresh, and transit invitation refresh.
- PR #46 surfaces one-time user-facing failure/recovery messages and marks the transit-invite control unavailable during a failed refresh. The patch reuses the existing chat/HUD feedback path and introduces no duplicate modal/window architecture.
- Verification: **L0 source review + successful merge**; no CI/browser/WebGL/Render verification observed.
- Next: continue stability audit for other silent failures and dead-end controls.


## 2026-10-04 — Atlas world-gate registration fix
- Live browser verification exposed a mismatch between Atlas world selection and the existing teleport node graph: built-in worlds had custom gate/pylon visuals but Atlas entry requires logical `world-gate:<id>` nodes.
- PR #75 corrected `src/main.ts` to register those logical world-gate nodes independently while reusing existing built-in visuals, preventing duplicate transit geometry.
- PR #75 merged as `24be7093609c10b40b21143476e9f3289b56be4b` and Render deploy `dep-db194cdg1s2s7394nqr0` is LIVE.
- Live replay of the failure path now succeeds: MAP → TIDELINE → ENTER WORLD produces route-lock and arrival feedback, with HUD world `HARBOR · DAY · SUMMER` and minimap district `HARBORLIGHT DOCKS`.
- Verification level: **L5 live deployment + browser interaction** for the Atlas/TIDELINE transit path. GitHub Actions returned no workflow run for the feature commit, so it is not CI-verified.
- Separate observation: Build Mode's region status remains `Connecting…` during unauthenticated/local verification and is tracked separately from this transit fix.

_Last updated: 2026-10-04_

## Checkpoint — 2026-10-05 — Runtime overlay stacking

- Current main is `fde47c3c3f3a24f596de0e6576165489008426c4`; Render deploy `dep-db19d17avr4c73asl6n0` is LIVE. The static Render service has no Render Postgres; Grid World code also contains Supabase integration, so runtime persistence remains a separate service boundary.
- Current live diagnostics report 11 monitored jobs healthy. Live inspection reproduced a high-impact layout defect: the shared `body.grid-world-page > *` rule changes all direct body children to relative positioning, overriding fixed HUD panels and overlays.
- Fix is on `aurora/fix-grid-page-overlay-stacking-2026-10-05`, commit `212ffd0e4a800d5a1cfaa68c3748d02fdbe6114d`. It moves the site backdrop into an isolated negative layer and keeps explicit positioning only on the game root.
- Verification: live browser/DOM reproduction on current main, plus branch source re-fetch. The fix is not yet merged/deployed; Render PR previews are disabled, and no build/CI result is claimed.
- Do not merge concept/canon PRs #57 or #58 without the user's approval; their own descriptions say they are awaiting creative approval. Other open PRs #63, #59, and #29 were preserved for separate review.
- **Next actionable item:** review the overlay stacking PR, then verify its Render deployment and repeat the live Atlas/HUD visual check before resuming the P0 audit.


## Checkpoint — 2026-10-10 — Overlay deployment reconciled; lifecycle authority merged

- PR #77 is merged as `78f346ae259b10f81c646f2403189aeb548e9bea`. Render's current live deploy is `dep-db4l8vnlot8c73bfm4dg` from commit `4a8230a20fde05c5c6202023a0cddfe0df992ebf`, a descendant of the overlay merge commit. Render reports build and deploy success on 2026-10-09.
- This is deployment/source-ancestry evidence only. A fresh browser visual interaction check could not be completed in this session because direct HTTP/browser access to the live URL was unavailable. Do not claim current Atlas/HUD geometry or WebGL interaction is verified.
- PR #106 merged as `25f3272bea13381d41116c33d0769d2de8b513bf`, adding conversation lifecycle authority TypeScript, a Supabase migration, and documentation. The latest Render deploy predates this commit; verify the current-main deployment path and database migration state separately.
- **Next actionable item:** live browser/WebGL verification of Atlas, fixed HUD overlays, responsive layout, world entry, movement/camera, and teleport preview. Then continue P0 security/stability review of open authority/RLS PRs. Keep canon/concept PRs #57 and #58 unmerged until Paul explicitly approves them.

_Last updated: 2026-10-10_


## 2026-10-10 — Current deployment and mineral RPC authorization audit

- PR #107 is merged; CI run #1452 passed. PR #108 is merged; CI run #1454 passed. Main is currently `8ac6d85956303efa8fafa93eddfe1ca746e3e82f`.
- Render had not auto-deployed this main revision despite auto-deploy being enabled, so a manual deploy was triggered: `dep-db55n3brjlhs73ch59ig`, source commit `8ac6d85956303efa8fafa93eddfe1ca746e3e82f`. Render completed the deployment successfully and now reports it `live` (verified deploy `dep-db55n3brjlhs73ch59ig`, source commit `8ac6d85956303efa8fafa93eddfe1ca746e3e82f`). This confirms deployment status/source, not browser/WebGL behavior.
- Supabase migration history confirms conversation lifecycle migrations and `20261010152323 restrict_team_post_rpc` are applied. Live SQL verified `insert_team_post(text,text,text,text,text,text)` is SECURITY DEFINER with empty search_path; browser roles cannot EXECUTE it or INSERT directly into `grid_team_posts`, while service_role retains access. PR #89's resource-sale RPC restriction is also effective; do not revise it based on the initial false alarm.
- Read-only audit found a P1 economy/gameplay gap: authenticated callers can seed mineral deposits in arbitrary existing worlds via `grid_seed_world_minerals(text)`, and can call `grid_mine_mineral(text,integer)` without server-side active-world/position/proximity validation. Both functions deny anon and pin an empty search_path, but authenticated authorization remains too broad. Tracked in issue #110: https://github.com/paulshaunreis/grid-world/issues/110. This was subsequently contained by merged PR #112 and the live Supabase migration `restrict_mineral_rpcs_until_authoritative_presence`; live SQL verifies anon/authenticated execution denied and service_role retained. Mining via these legacy RPCs is intentionally gated until a trusted server-authoritative interaction path exists.
- Security Advisor reports 51 authenticated-callable SECURITY DEFINER functions and Supabase Auth leaked-password protection disabled. Treat the function count as a review queue, not proof all functions are exploitable; review per function and do not bulk-revoke. Four RLS-enabled/no-policy tables were checked: three deny browser table access, and `grid_operator_policy_rules` has no row visibility via RLS.
- **Next:** recheck the Render deploy, then do the live browser/WebGL pass (Atlas/HUD stacking, narrow viewport, world entry, movement/camera, teleport preview). Implement and test a server-authoritative mineral interaction path before restoring browser mining. The migration is already applied; do not re-enable the legacy RPCs without world/presence/position checks. Review the Auth leaked-password-protection setting. Keep concept/canon PRs #57 and #58 awaiting explicit user approval.

_Last updated: 2026-10-10_


## Security continuation — trusted mining boundary (2026-10-10)

- Tracking issue: https://github.com/paulshaunreis/grid-world/issues/114
- Design plan: `docs/SECURITY_TRUSTED_MINING.md`
- Live audit confirmed authenticated users can insert/update their own `player_state` row. Client-provided player coordinates are forgeable and must never be treated as proof of proximity.
- Legacy `grid_mine_mineral` mutates deposits and both mineral/vault inventories but does not validate trusted world position or range. Browser execution remains revoked by applied migration `20261010155305_restrict_mineral_rpcs_until_authoritative_presence`; live grants were previously verified as denied to `anon` and `authenticated`, granted to `service_role`.
- Do not reopen mining until movement/presence is server-owned and movement/teleport transitions, range checks, cooldowns, replay protection, and atomic inventory writes are covered by tests and authenticated end-to-end verification.
- Verification status: read-only live schema/function/policy inspection completed; no new runtime path or end-to-end mining test was implemented in this pass. Mining remains gated intentionally.


## Movement security follow-up (2026-10-10)
- PR #116 merged as `abb48147263aac8eabcb54781663fb6d8d668339`; GitHub Actions run #1468 passed.
- The stale-sync movement bypass was removed and the repository's `grid-combat` source was deployed to Supabase Edge Function version 21.
- Post-deploy verification confirmed JWT verification remains enabled, the old bypass expression is absent, the strict distance guard is present, and live function source exactly matches `main`.
- This is not full trusted presence: `region_id` still accepts a client-supplied value in the function's generic sync path, and there is no validated server-owned teleport/world transition yet. Mining stays gated until those controls, interaction range/cooldowns/replay protections, atomic inventory updates, and authenticated end-to-end tests are implemented.


## 2026-10-10 — Desktop runtime direction

Paul approved proceeding toward a standalone Grid World desktop client while keeping the browser client supported. Read docs/GRID_DESKTOP_RUNTIME_ROADMAP.md for the staged plan and docs/GRID_RUNTIME_PORTABILITY_MAP.md for the source-level module map.

**Current evidence:** package.json uses Vite + TypeScript + Three.js. GridEngine and ThreeGridRenderer provide an early abstraction, but GridEngine itself is coupled to Three.js scene/camera types. src/main.ts directly creates the WebGL renderer and canvas, wires DOM camera/mouse controls, and owns much of the runtime bootstrap. World.ts and other scene systems construct Three.js objects directly; Input.ts uses global keyboard/gamepad APIs; WindowManager is HTMLElement/CSS-specific; Draco asset loading assumes a web-served path. A wrapper alone is not a native engine migration.

**Decision:** no engine selection yet. Preserve the browser client and shared service/authority model. First establish a reproducible build baseline and asset-path inventory, then extract a narrow, behavior-preserving browser adapter. Compare Three.js with a candidate native runtime through a small Windows vertical slice. Do not duplicate accounts, inventory, social, economy, world identity, or trusted gameplay state in the desktop client.

**Verification:** source-level repository audit and documentation only. No build/test/browser run, desktop package, or engine migration was performed in this pass. The inspected package has no test script; its build script is grid-code-analyzer.mjs && tsc && vite build.
