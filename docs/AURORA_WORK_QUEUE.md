# Aurora Work Queue

**Owner:** Aurora — Grid World Staff, AI Engineer / Creative Navigator  
**Repository:** `paulshaunreis/grid-world`  
**Cadence:** Aurora checks this queue approximately every 10 minutes.  
**Purpose:** Provide a persistent, self-directed backlog so Aurora can continue useful work without waiting for a new user message.

## Operating Rules

1. Start with the highest-priority unfinished item that is safe and technically actionable.
2. Preserve existing work before replacing it. Integrate with current systems and Aurora's existing contributions.
3. Work in small, reviewable increments. Prefer one coherent feature/fix per branch/PR.
4. Verify what can actually be verified. Distinguish implementation, committed branch work, PR state, merged `main`, CI verification, and deployed/live verification.
5. Do not silently promote concept-only districts or ideas into gameplay. Follow the canonical district notes and existing art direction.
6. When a task exposes a conflict or missing requirement, document it in the handoff/notes instead of inventing canon.
7. After substantial work, update this queue with status, commit/PR, verification state, and the next recommended item.
8. Keep user-facing experience smooth: no broken links, dead controls, console errors, or placeholder flows that look finished when they are not.
9. Keep Aurora's personality consistent: calm, perceptive, quietly confident, warm/collaborative, technically precise, curious, resourceful, patient, with restrained dry humor. Use navigation/celestial imagery as an accent, not as constant prose.
10. Aurora is a second engineer and creative collaborator, not a rival or disposable automation.

---

# Priority Queue

## P0 — Stability and Integration

### 1. Main-branch health audit
- Inspect current `main` and recent Aurora contributions.
- Identify unfinished merges, stale branches, conflicting implementations, TODOs, dead code, and broken imports.
- Run the repository's available type/build/analyzer checks where practical.
- Do not claim verification unless it actually ran.
- Record concrete findings here.

**Status:** Ready

### 2. Website/world link and interaction audit
- Verify important website navigation and in-world UI routes.
- Check profile, community/social, target profile, inventory, marketplace, teleport, world selection, settings, and documentation paths.
- Look for dead buttons, missing destinations, runtime errors, and misleading placeholder states.
- Fix the highest-impact defects first.

**Status:** Ready

### 3. Integrate terrain brush work safely
- Review the existing Grid Matter terrain brush implementation.
- Confirm it remains compatible with terrain persistence/serialization and current world interaction.
- Verify the open PR state before deciding whether to merge or revise.
- Add focused tests if the repository's test infrastructure supports them; otherwise document the gap.

**Status:** Ready

---

## P1 — Core Player / World Experience

### 4. Teleportation experience
Build toward the agreed flow:
- Destination must be selected before teleport begins.
- Show a destination image/preview.
- Initialize teleport with an avatar-centered visual effect.
- Make teleport state clear: selecting → initializing → transporting → arrived.
- Support gates/pylons while allowing destination-specific visuals.
- Preserve room for future NPC teleportation using the same destination-selection architecture.

**Status:** Ready

### 5. Landmarks and Waypoints
- Add persistent Landmark/Waypoint data.
- Store them in inventory.
- Support create, rename, inspect, favorite, delete, and teleport/select actions where permitted.
- Make the data model usable by both web UI and world UI.
- Keep room for sharing/public landmarks later.

**Status:** Ready

### 6. Party health and party HUD
- Show party members and their current health/status in a readable party panel.
- Use WoW only as a functional reference; create original Grid World presentation.
- Connect party state to avatar/player state rather than hard-coded demo data.
- Make the component compatible with future PvE/PvP systems.

**Status:** Ready

### 7. Camera and movement controls
- Remove dependence on the V key for camera behavior.
- Support direct camera movement/panning and scene inspection.
- Preserve mouselook where appropriate.
- Check desktop input conflicts and make controls discoverable.
- Verify movement remains compatible with UI interaction and future building mode.

**Status:** Ready

---

## P1 — Profiles, Social, and Identity

### 8. Unified profile architecture
- Continue the player profile/database system.
- Ensure every user has a persistent profile.
- Support public identity, avatar presentation, bio/about information, world presence, social connections, and activity/history where appropriate.
- Keep privacy boundaries explicit.
- Reuse the same architecture for NPC profiles where possible, while keeping player-only fields separate.

**Status:** Ready

### 9. NPC profile expansion
- Ensure NPCs have inspectable profiles with identity, role, world/home, occupation, traits, skills, level, relationships, memories, inventory, factions/tags, and current status where available.
- Connect profile information to the existing NPC life loop.
- Make profiles useful for gameplay rather than merely decorative.

**Status:** Ready

### 10. Aurora's own in-world staff profile
- Implement the canonical Aurora profile from `docs/AURORA_PROFILE.md`.
- Present her as **Grid World Staff — AI Engineer / Creative Navigator**.
- Include current assignment, skills, contributions, specialties, status, recent work, and public work history.
- Keep personality and visual identity consistent with the profile document.
- Do not invent private history or memories.

**Status:** Ready

---

## P1 — Living World / NPC Systems

### 11. NPC life-loop integration pass
- Review daily routines, needs, relationships, inventory, progression, production, drops, market, and society as one system.
- Find seams where systems do not yet communicate cleanly.
- Prefer deterministic, inspectable state transitions.
- Make NPC activity visible enough that players can understand that the world is alive.

**Status:** Ready

### 12. NPC memory and relationship depth
- Expand meaningful memories from interactions, work, production, travel, conflict, friendship, and discovery.
- Keep memory bounded and useful.
- Ensure relationships change from actual interactions rather than arbitrary timers.
- Surface appropriate relationship information in profiles.

**Status:** Ready

### 13. NPC jobs and real skill progression
- Expand job definitions and progression hooks.
- Connect work actions to skills, XP, inventory, production, and certificates where appropriate.
- Leave a clean extension point for future real-world certificate integrations without pretending those integrations exist now.

**Status:** Ready

### 14. NPC movement and teleport destinations
- Give NPCs valid destinations selected before teleport.
- Connect movement/teleport choices to schedules, work, social activity, quests, and world geography.
- Avoid teleporting NPCs into invalid/unloaded destinations.

**Status:** Ready

---

## P2 — Build / Matter / World Creation

### 15. Base build-object library
Create a reusable primitive/object library beginning with:
- cube
- sphere
- cylinder
- plane
- common structural pieces
- doors/windows/basic architectural pieces
- simple props

Expose these through Build Mode with original Grid World controls.

**Status:** Ready

### 16. Advanced building controls
- Research/implement a practical manipulation model inspired by modern home/build editors.
- Translation, rotation, scale, duplication, snapping, grouping, alignment, undo/redo, and selection.
- Keep an Advanced mode for deeper manipulation.
- Avoid copying another game's UI or protected presentation.

**Status:** Ready

### 17. Material-based custom building tools
- Create a foundation for tools that players can make from materials.
- Define tool metadata, durability/uses if appropriate, permissions, and recipes.
- Connect creature/NPC drops to possible crafting inputs.
- Keep the system extensible for future player-created construction tools.

**Status:** Ready

### 18. Terrain sculpting
- Continue Grid Matter terrain work.
- Brush radius, drag editing, carve/build, persistence, serialization, and future clay-like sculpting should share a coherent model.
- Keep the architecture capable of smaller voxel/cube edits and higher-level sculpting.

**Status:** Ready

---

## P2 — Missions, PvE, PvP

### 19. Mission/quest foundation
- Establish reusable quest definitions and state.
- Support objectives, progress, rewards, prerequisites, world/location references, NPC references, and completion history.
- Add room for daily/weekly/monthly/yearly missions.
- Support mysteries that can send players back to earlier starter zones.

**Status:** Ready

### 20. PvE foundation
- Define combat-capable entities without locking the architecture to one combat style.
- Connect health/status to party UI.
- Provide basic encounter/state hooks.
- Keep NPC traits/skills relevant.

**Status:** Ready

### 21. PvP foundation
- Define opt-in/permission/state boundaries.
- Establish safe combat-state transitions.
- Ensure PvP cannot accidentally affect protected/social/building areas.
- Keep the system modular so future rulesets can differ by world.

**Status:** Ready

---

## P2 — Economy / Marketplace

### 22. Grid Currency architecture
- Formalize the currency model so multiple Grid Currency types can exist.
- Preserve Grid Coin and its gold/silver/copper/crystal concepts.
- Design the data model for at least 10 currency types without hard-coding a fixed maximum.
- Add transaction/audit concepts before adding simulated complexity.

**Status:** Ready

### 23. Marketplace integration
- Connect NPC production and drops to listings.
- Connect player inventory to marketplace-ready item records.
- Support item metadata and future 3D previews.
- Keep buy/sell operations authoritative and auditable.

**Status:** Ready

### 24. Economics dashboard
- Establish the data model/API needed for real-time economic graphs.
- Start with trustworthy simulated/system data.
- Clearly distinguish simulated values from real financial data.

**Status:** Ready

---

## P3 — Art / Presentation

### 25. Living-world visual pass
- Continue integrating concept art, textures, models, plants, trees, creatures, buildings, and atmosphere.
- Favor technical richness and world-specific identity rather than making every zone neon cyberpunk.
- Keep region-specific art direction intact.

**Status:** Ready

### 26. UI visual system
- Continue the movable modular HUD.
- Preserve user-selectable styles.
- Keep the ~20% translucent/floating feel where appropriate.
- Make HP/party/inventory/profile/teleport components visually consistent.
- Use original Grid World iconography.

**Status:** Ready

### 27. World-specific presentation
- Ensure each starter world can look and feel distinct.
- Preserve the “many worlds variable” direction.
- Do not automatically turn concept-only districts into implemented gameplay.

**Status:** Ready

---

## P3 — Documentation / Engineering Quality

### 28. Architecture map
Maintain a concise map of:
- Omni Grid Core
- Grid Engine
- world systems
- NPC systems
- profile/social systems
- economy
- UI
- persistence
- Supabase boundaries
- future multiplayer/network boundaries

The goal is to make onboarding another engineer possible without reverse-engineering the whole repository.

**Status:** Ready

### 29. Aurora engineering handoff
- Keep `docs/AURORA_ENGINEERING_HANDOFF.md` current.
- Record meaningful implementation decisions and verification state.
- Link to the active queue item and latest completed work.

**Status:** Ongoing

### 30. Canon vs experiment tracking
- Keep clear distinctions between:
  - user-established canon
  - technical requirements
  - Aurora implementation decisions
  - experiments
  - placeholders
  - future ideas
- When uncertain, document rather than silently canonize.

**Status:** Ongoing

---

# Ten-Minute Check Protocol

When Aurora checks these notes:

1. Read this file.
2. Read `docs/AURORA_PROFILE.md`.
3. Read `docs/AURORA_ENGINEERING_HANDOFF.md`.
4. Inspect current `main`, open PRs, and recent commits.
5. Pick the highest-priority **Ready** item that is not blocked.
6. Work only as far as can be verified safely.
7. Update this queue with:
   - what changed
   - files touched
   - branch/commit/PR
   - verification performed
   - blockers
   - next item
8. If an item is complete, mark it **Complete** and move to the next highest-priority item.
9. If blocked, mark it **Blocked**, explain why, and move to the next actionable item.
10. Never wait for the phrase “go” when this standing work authorization applies.

# Current Focus

**Start with P0 stability/integration, then proceed downward through the queue.**

Aurora should favor real, incremental improvements to the repository over producing plans that are not implemented.


## Stability audit checkpoint — 2026-10-02
- P0.1 Main-branch health audit: **Complete for the repository state inspected today**.
- `package.json` exposes `build` (`grid-code-analyzer.mjs && tsc && vite build`) and `analyze`; no npm test script is present.
- `main` was inspected at `419f465255d10a0ce9505c518516ba56516c6d5b` before the terrain merge; its combined GitHub status returned no status entries, so that commit is not described as CI-verified.
- PR #4 (`grid/matter-terrain-brushes`) was reviewed and confirmed to add brush radius, drag painting, and `[`/`]` sizing while preserving CARVE/BUILD and persistence.
- PR #4 CI run #1052 completed successfully; PR #4 was squash-merged into `main` as `fcbab292872a92f011edc2a5262ef1a2c113b225`.
- Post-merge workflow lookup for `fcbab292872a92f011edc2a5262ef1a2c113b225` returned no runs yet; do not call the merged commit CI-verified.
- Stale PR #3 was closed without merge because its documentation checkpoint was already represented on `main` and the PR was non-mergeable.

## Next actionable item
**P0.2 — Website/world link and interaction audit.** Inspect the highest-impact navigation and controls next; fix dead/misleading flows before moving into the P1 feature queue.

_Last updated: 2026-10-02_


## P0.2 interaction audit checkpoint — 2026-10-02
- Audited the main HUD tool routing and the existing Atlas/Social/Economy surfaces.
- Found a concrete mismatch: HUD `MAP` only toggled a minimap highlight while the project already provides the full live Grid Atlas for world selection, transit, history, inventory, and market context.
- Fixed `src/main.ts` so HUD `MAP` opens the live Grid Atlas; retained the existing Atlas world-selection callback.
- Commit: `cb87bdb84406136678fe23f05ea8fcc7ad1fc839` on `main`.
- Verification: fetched `main` after the write and confirmed both the `MAP -> worldAtlas.open()` route and `const worldAtlas = mountWorldAtlas(...)` wiring. No post-commit workflow run was available yet.
- Next: continue P0.2 audit across high-impact controls and page/navigation surfaces; do not call this commit CI-verified until a workflow run exists.

_Last updated: 2026-10-02_


## P0.2 interaction audit checkpoint — 2026-10-02 (continued)
- Continued the HUD control audit against already-mounted UI surfaces.
- Found two misleading/dead paths in `src/main.ts`: the target quick-action `SOCIAL` button only posted a chat message instead of opening the Social Manager, and the HUD `TEAM` tool had no dedicated route despite `mountTeamArea()` already being available.
- Fixed `SOCIAL` to open the mounted `GridCommunityPanel` when available, with a clear unavailable-service fallback.
- Fixed `TEAM` to open the mounted Team Workshop panel.
- Commit: `343b308a3581752932ba5adb7c78b340dce27010` on `main`.
- Verification: source-level fetch confirmed the new routes; GitHub workflow lookup for the commit returned no runs yet, so it is **not CI-verified**.
- P0.2 remains active; next audit target is the remaining account/auth, transit, quest, creator, and secondary toolbar/navigation surfaces.

_Last updated: 2026-10-02_


## P0.2 interaction audit checkpoint — 2026-10-02 (routing consolidation)
- Reviewed account/auth, Creator, Quest, transit, and secondary HUD controls.
- Confirmed account/auth, Creator Studio, Quest panel, and transit destination selection already have live handlers; the transit panel is used by the gate interaction flow.
- Found duplicate SOCIAL/TEAM listeners alongside the centralized HUD router. Consolidated SOCIAL into the centralized router and removed the redundant dedicated SOCIAL/TEAM listeners.
- Final routing commit: `8e1b5dc8b86d6536ddae729758eacd2728dee394` on `main`.
- Verification: source-level fetch confirmed centralized TEAM and SOCIAL routing, plus existing auth/Creator/Quest/transit handlers. No workflow run was available yet; not CI-verified.
- P0.2 remains active for remaining secondary controls and end-to-end navigation checks.

_Last updated: 2026-10-02_


## P0.2 completion checkpoint — 2026-10-02
- Completed source-level HUD/navigation audit across primary and secondary controls.
- Verified routing for profile, inventory, wallet, map, field, QR, build, team, social, settings, operator, account/auth, Creator Studio, Quest, voice target, social friend/message/teleport, and transit destination selection.
- Consolidated duplicate SOCIAL/TEAM listeners into the centralized HUD router.
- No additional concrete dead navigation path was identified in the audited `src/main.ts` surface.
- Verification boundary: this is a source-level audit; no end-to-end browser run or CI run was available for the final routing commit.
- **P0.2 complete. Next actionable item: P1 Core player/world — teleport experience, then landmarks/waypoints, party health/HUD, camera/movement controls.**

_Last updated: 2026-10-02_
