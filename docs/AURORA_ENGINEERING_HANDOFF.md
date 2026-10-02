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
