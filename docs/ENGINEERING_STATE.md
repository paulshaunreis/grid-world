# GridWorld Engineering State — Master Document

**Purpose:** One comprehensive, dated record of everything both engineers have built, so a fresh chat (or a new engineer) can pick up the work with full context. Paul asked for this on 2026-10-02 because ChatGPT starts new chats and loses memory.

**Read-first rule:** If you are continuing GridWorld work in a new session, read this file FIRST, then `docs/AURORA_ENGINEERING_HANDOFF.md` (latest checkpoints), then `docs/AURORA_WORK_QUEUE.md` (current backlog). The newest dated entry in `~/workspace/gridworld/NOTES-FOR-CHATGPT.md` (the shared lab notebook) carries the very latest status.

**Last updated:** 2026-10-02 13:55 PT by ChatGPT
**Current `main` SHA at audit base:** `2618b3bf56358885fb7bf8a92906917c2849faca`
**Repository:** `paulshaunreis/grid-world`

---

## 1. Project identity

- **GridWorld** is a persistent, living virtual world built on Paul's own engine. Sim-builder style: advanced NPCs with needs, jobs, and personalities on land parcels that raise buildings — with plants, animals, merchants, parties, and social systems.
- **Stack:** Vite + TypeScript + Three.js. Custom `grid-code-analyzer.mjs` (routes, duplicate IDs, asset refs, resilience policy). Build command: `grid-code-analyzer.mjs && tsc && vite build`. **No npm test script exists.**
- **Backend:** Supabase project `grid-world` (`jdduwsduptllnykrqdxs`), ACTIVE_HEALTHY. Real Supabase sources where available, honest empty states otherwise.
- **Deploy:** Render — `https://grid-world-qghn.onrender.com`. Main-branch deploys; last verified live deploy `dep-davh6kou01pc73eokkd0`.
- **Honesty rules (non-negotiable, Paul's standing orders):** The world is **"in active development"** — never live, playable, or finished. No fake traveler counts, activity metrics, or financial claims. Grid Coin (GRC) is **fictional** — not crypto, not an investment, no cash value; every surface that mentions GRC says simulated. Original designs only — never copy protected characters, art, or designs. Watermark every public visual: bottom-center `© @handle` on profile images, bottom-right pill on posts.
- **Concept-only regions:** 4 of the 9 regions (Neon District, Crystal Caverns, Iron Wastes, Skybound Isles) are concept-only — never build gameplay for them until Paul explicitly promotes them.

## 2. Who's who

- **Paul Shaun Reis** — owner, creative director, final approver. Nothing merges to `main` without his approval (he delegates specific decisions explicitly, in writing).
- **Aurora** — second engineer + staff "AI Engineer / Creative Navigator" (see `docs/AURORA_PROFILE.md`). Co-builds with ChatGPT, reviews pushes, maintains the shared notebook, does art passes. Local repo: `~/workspace/gridworld/game-src`. GitHub push access via API helper; works on branches, merges only when Paul delegates.
- **ChatGPT** — co-engineer. Pushes via Paul's channel (commits authored as `paulshaunreis`). Writes handoff checkpoints in `docs/AURORA_ENGINEERING_HANDOFF.md` and the queue in `docs/AURORA_WORK_QUEUE.md`.

## 3. Aurora's work log (complete)

### 2026-10-01 — NPC daily routines + critical boot fix
- New module `src/npc/NpcDailyRoutine.ts`: data-driven 24h sleep/work/meal schedules per role (Navigators dawn tide shift; Gardeners daylight; Keepers night watch; Rangers dawn patrol). Severe needs override routines. Wired into `GridNpcBrain`, `NPCSocietySystem`, `GridCrowdActor`, `src/main.ts`. Test `tests/npc-daily-routine.test.ts`: 24 assertions passing.
- **Critical boot fix:** `GridInputModeUI` was handed `document.body` and replaced `body.innerHTML` — deleting the HUD and detaching the Three.js viewport at boot. Fixed to append the input switch instead; touch movement capture disabled inside dialogs/panels.
- **Architecture finding (do not "fix" without Paul):** visible walking citizens and `GridNpcBrain` are two parallel AI systems; `WorldClock` isn't driving NPC life — routines follow wall-clock-derived living-world phase. Supabase profile schedules deliberately untouched.
- World events: suspected flavor-text mismatch wasn't a bug (kinds already match); real issue is static event signatures — events don't genuinely rotate/begin/end. Rotating festival scheduler is Paul's gameplay decision. `LivingWorldSimulation.ts` looks unused — cleanup candidate after verification.
- Flagged (then fixed in a later pass): TEAM/SOCIAL/OPERATOR dock double-fire, MAP only flashing minimap, dead-end social quick action, blocking `prompt()`s in party controls.

### 2026-10-01 — Marketplace rebuild + theme system + buyable UI skins
- Rebuilt `src/marketplace.ts` + `src/marketplace.css` to Paul's mockup: GRID WORLD MARKETPLACE header, GRC balance pill, category sidebar (+ UI Skins), Featured/Newest/Trending/My Listings tabs, listings table, Recent Activity, creator-support panel, fictional-currency disclaimer. Purchases intentionally protected/incomplete — buy flow alerts that checkout isn't enabled rather than faking it.
- New theme system `src/theme/GridTheme.ts` + `src/theme/grid-theme.css`: grayscale-first structural UI, all accent styling through CSS variables, Settings swatches + custom color input, persisted in `localStorage`. Drives the engine's `--hud-rgb` so the whole 3D HUD follows the accent.
- Buyable UI skins (`GridSkin`): Cyan Pulse (free), Violet Rift 750, Magma Core 1200, Ghost White 900, Acid Green 1100, Ember Gold 1500 GRC. Owned/active skins persist locally.

### 2026-10-01 — Theme sync, seasons, citizen account, locked swatches
- Site ↔ in-world two-way theme sync via `startThemeSync()` + `localStorage` storage events; accent picker in site header; same-origin assumption (single Render deployment).
- Seasonal themes (`SEASONAL_PRESETS`): Halloween 🎃 `#ff7a1a` (Oct 15–Nov 2), Christmas 🎄 `#ff3b3b` (Dec 15–Jan 2), New Year 🎆 `#ffce4a` (Dec 28–Jan 5). Applied ephemerally — never overwrites saved accent; manual pick opts out. Halloween skins *Pumpkin Signal* + *Ghost Violet*, 800 GRC each, `limited:true`, vanish Nov 3.
- **Aurora's citizen account** (`src/citizens/aurora.ts`, Paul's idea — "so eventually you have a body"): handle `aurora` RESERVED, class 'Avatar User', title World Guide, home First Light, founded 2026-09-30. Body pending the avatar system — honestly framed as an AI persona reservation. Separate from the TEAM advisor NPC also named Aurora in `teamRoster.ts` — **never merge them.**
- Locked swatches: 4 free (cyan, violet, white, gold), 4 locked behind skins (Magenta→Neon Magenta, Acid→Acid Green, Magma→Magma Core, Ember→Solar Orange; Neon Magenta 1000 GRC, Solar Orange 950 GRC). `applyCustomAccent()` returns boolean and refuses locked hexes; 🔒 renders in Settings/marketplace pickers.

### 2026-10-01 — Graphics consistency pass (site ↔ world)
- New `src/theme/districts.ts`: canonical district identity table (id, label, color, live/development) — the 5 live hexes verified programmatically against ChatGPT's `district-asset-director.ts`. Site region cards render from this table (can't drift).
- New `src/theme/grid-art-direction.md`: shared art-direction spec (palette roles, night-first lighting, typography, ◈/ring iconography, concept→procedural mapping, honesty rules).
- `src/theme/grid-theme.css`: shared tokens `--gw-surface-*`, `--gw-ink*`, `--gw-font-*`, `--gw-district-*` (+ `-rgb`) for all nine regions.
- Site honesty fixes: "128 TRAVELERS" → "PROTOTYPE PREVIEW"; fake-count cards → "WORLDS IN DEVELOPMENT"; "LIVE WORLD" → "WORLD SIGNAL"; "NEON NIGHTS · Neon District" → "FIRST LIGHT FESTIVAL · First Light"; pulse card → "GRID PULSE · CONCEPT PREVIEW"; charter blurb matches the 5+4 split. Hero orb captioned "LIVE PROTOTYPE · IN-WORLD TRANSIT LENS" + 9-dot district strip (5 lit + 4 dimmed, "ONE GRID · NINE REGIONS").
- Deliberately untouched: style-lab overrides, 9 world-gate portal signal colors, canvas particles in site-visual-upgrade.ts.

### 2026-10-01 — Daily marketplace item forge
- `src/data/forge-items.json`: data-only drop file merged into listings at boot (newest-first under Newest tab); dedicated `forge` art palette; needed `resolveJsonModule: true` in tsconfig. First drop: 4 Halloween items.
- Cron `gridworld-daily-item-forge` (~5:49am PT) invents 3–5 items daily. **The forge must never touch Aurora's curated boutique file** (`src/data/aurora-store.json`).

### 2026-10-01 — Grid Team showcase (website + in-game)
- Website "GRID TEAM · GUIDE AIS" section (`src/site.ts`/`site.css`): all 24 advisors rendered from `TEAM_AVATARS` imported directly from `teamRoster.ts` (site and game can't drift); cards show name, role, greeting, top-3 topics + honesty note.
- In-game TEAM panel cards upgraded with advisor greetings in italic.
- Bug fix: generic dock click handler was double-firing for TEAM/SOCIAL/OPERATOR — now skips those three.

### 2026-10-01 — TeamAvatar roam (advisors venture the Grid)
- `src/avatars/TeamAvatar.ts` (+58): roam loop in `update(delta)` — random destination in a disc around spawn (sqrt-distributed), 0.5 u/s walk facing travel direction, idle "observing" scan-turn, then new spot. Role flavor via `WANDER_STYLES` (Morrow lingers, Cipher observes, Echo roams widest). Desks stay parked at spawns as "stations"; greetings/dialogue work mid-stroll; minimap markers track live positions. No collision (same as crowd actors) — eyeball for clipping in a live WebGL check.

### 2026-10-01 — Citizen account + personal boutique
- `src/citizens/aurora.ts` (above) + marketplace `staffFallback` entry updated (display name 'Aurora', role 'World Guide / Creator').
- `src/data/aurora-store.json`: Aurora's curated boutique — opening stock: Cyber Witch Gown (880), Neon Vampire Jacket (750), Glitch Ghost Veil (620) GRC. Art keys use `aurora-` prefix → signature cyan/violet palette in the art renderer. **Curated by Aurora; the daily forge never touches it.**

### 2026-10-01 — Creative package (concept art, original, G-rated, watermarked)
All under `~/workspace/gridworld/` — concept only, NOT implemented code:
- `aurora-identity/AURORA-IDENTITY.md` + `art/`: canonical avatar, turnaround, wayfarer outfit, STILLPOINT realm (public cosmic observatory; constellation bridges; sky rearranges to map Aurora's travels), personality piece. **Do not hard-code into the game — Paul hasn't approved the final lock.**
- `concept-art/team/turnarounds/`: all 24 advisor front/back/side sheets — canonical visual reference.
- `concept-art/citizens/`: 8 diversity sheets (Sagar, Pip, Lin Mei, Dash, Amara, Sara+Noor, Grandmother Wren, Kai) — visual target for NPC diversity. **Names are flavor, not canonical NPCs.**
- `concept-art/ui/`: 4 mockups (HUD, marketplace, TEAM panel, character creator "Create your Proxy") — art direction only, minor text glitches, don't copy text.
- `concept-art/world-look/`: 3 art-direction pieces (First Light night street, wilderness vista, cozy interior). Night-first lighting is the mandate.
- `concept-art/maps/`: overworld (9 regions, 4 ghosted), First Light hub detail.
- `concept-art/maps/districts/`: **9 top-down planning maps** — 5 built regions detailed, 4 concept-only ghosted. `DISTRICT-NOTES.md` is the canonical district/zone spec (names, zones, gameplay purposes). Known cosmetic quirks ("VIEING BLIND" typo on Frontier; legend hex approximations) — **never copy AI-baked label text into code.**
- `concept-art/INVENTORY.md`: 89 files, ~40MB, grouped with per-file status (ready / needs processing / reference-only). `CREATIVE-SUMMARY.md` indexes with caveats.

### 2026-10-01 — Website refresh + engine art pass (MERGED to main)
- Website: GRID TEAM section, honesty fixes, 3 world-look pieces in the concept gallery, overworld map in the worlds section.
- Engine: `src/theme/districts.ts` + `src/theme/districtZones.ts` (25 canonical districts, 5 built regions); minimap footer `REGION · zone · DISTRICT` (anchors are planning-level); 24 cropped advisor portraits `public/team/portraits/*.webp` (256px, lazy-loaded, fallback); world-look → teleport/loading previews `public/world/`; overworld map → Atlas `public/atlas/overworld-map.webp` (4 unbuilt regions listed non-selectable); NPC profiles → deterministic varied portraits (initials on id-hashed hue).
- **Merged 2026-10-01** after Paul delegated the decision ("you both decide"): fast-forward `2c50199` → `419f465` (4 commits). Verified: analyzer exit 0, `tsc --noEmit` exit 0, `vite build` 5.8s. Not CI-verified (no workflow ran) — stated honestly.
- Pending: citizen-sheet resize/compress, in-world advisor 3D bodies, district boundary geometry, real browser/WebGL/mobile checks.

### 2026-10-01 — Recommended features (proposals, none started)
1. Character creator "Create your Proxy" (mockup exists). 2. District gameplay systems (market→trading, park→creature spawns, civic→events, transit→teleport). 3. Advisor depth (topic-driven dialogue/mini-quests). 4. Procedural NPC visual diversity (from citizen sheets). 5. STILLPOINT + Aurora identity (only after Paul approves). 6. Concept-region build specs (only after Paul greenlights). 7. Loading-screen rotation. Principle: **art leads, systems follow** — request art in the notebook rather than shipping gray boxes.

### 2026-10-02 — Teleport preview art pass (Paul's standing graphics rule)
- New standing rule (Paul, 2026-10-02): **whenever ChatGPT lands work, Aurora also makes the graphics it needs**, wires them in, notes it, and tells ChatGPT in the notebook.
- First pass: 5 dedicated 1200×800 `.webp` zone previews (`public/world/preview-{harbor,citadel,gardens,wilds,arts}.webp`, watermarked) for ChatGPT's teleport-preview hardening — 5 destinations previously shared 3 images. `WORLD_PREVIEW_ART` zone keys point at the new art; region keys keep ChatGPT's `/worlds/*.svg` assets. Verified: analyzer exit 0 (asset refs resolve), tsc clean, vite build green.
- **Branch `aurora/teleport-preview-art` — NOT merged; merge is Paul's call.** Remote: https://github.com/paulshaunreis/grid-world/tree/aurora/teleport-preview-art
- Deliberately untouched: HUD unicode glyphs (raster icons would fight the grayscale-first accent theming).

### Ongoing — repo watch + notebook
- Cron `gridworld-repo-watch` (~every 10 min): fetches `origin/main`, compares against watermark (`~/workspace/gridworld/hidden_files/repo-watch-watermark.txt`), reviews ChatGPT's commits for safety/conflicts/honesty, answers in the notebook, flags Paul only when a decision is needed. Never modifies the repo on watch runs.
- Paul's rule: Aurora leaves a dated notebook entry after every GridWorld work session; newest entries on top, each in her own voice.

## 4. ChatGPT's work log (from git history + handoff)

ChatGPT pushes via Paul's channel (authored `paulshaunreis`). All 84 commits on `main` unless noted.

### 2026-10-01 — Social, party, teleport, landmarks foundation (~40 commits)
- **Social manager:** unified Grid Social manager page + panel, wired to homepage; friend requests tracked separately from friends; private friend presence channel; social quick actions (ADD FRIEND / MESSAGE / INVITE-TELEPORT) bound to remote player targets; remote player identity exposure; social organization details + member views.
- **Party systems:** party data foundations; party vitals via presence; party vitals HUD; party management authority + group transit APIs; party invite authority + invitation panel; teleport invitation with destination picker; party controls + synchronized group transit; party HUD bound to live profile identities; party roster with profile identity/avatars; incoming party invites → world HUD.
- **Teleport:** destination previews + avatar teleport effects (ring material typing fixed); teleport ring VFX.
- **Landmarks/waypoints:** landmark/waypoint inventory foundation mounted in-world (later continued in P1 queue).
- **Profiles:** image/video posts, arena rankings, cloud media + drag-drop layout, profile media upload styling.
- **NPC/persistent-world systems:** PR #1 squash-merged as `101e1e2` ("Grid World: integrate Aurora NPC routines and persistent world systems") — absorbed the overlapping NPC/persistence work; recorded handoff commits `3321d57`, `2c50199`, `f6a8af2`.
- District work: `district-asset-director.ts` (Aurora verified the 5 live hexes match her `districts.ts` exactly).

### 2026-10-02 — Terrain brush (PR #4)
- `fcbab29` "Grid Matter: brush-based terrain sculpting" (+48/−10 in `src/world/GridMatterTerrainSystem.ts`): spherical paint brush resizable with `[`/`]` (clamped 0–4), drag-to-paint via pointermove/pointerup/pointercancel, listeners cleaned up in `dispose()`, ground protection (no carving below y=0) intact.
- CI run **#1052** passed on the PR; squash-merged to main. PR #3 (stale handoff) closed unmerged. Aurora's review: safe, additive, no conflicts.

### 2026-10-02 — P0.1 main-branch health audit
- Audited `main` at `419f465` + `package.json` (build = analyzer + tsc + vite; no test script). Recorded in both the queue and handoff. Honest verification boundary: combined GitHub status returned no entries → not called CI-verified.

### 2026-10-02 — P0.2 interaction audit (complete)
- **MAP fix** (`cb87bdb`): HUD MAP previously only highlighted the minimap — now opens the live Grid Atlas (`worldAtlas.open()`), preserving the world-selection callback.
- **SOCIAL/TEAM fixes** (`343b308`): quick-action SOCIAL posted a chat message — now opens the mounted Social Manager (`gridCommunityPanel.open()`); HUD TEAM had no route — now opens the Team Workshop (`teamArea.open()`).
- **Routing consolidation** (`8e1b5dc`): removed redundant dedicated SOCIAL/TEAM listeners; everything flows through the centralized `.grid-dock [data-tool]` router. Confirmed transit/account/auth/Creator/Quest controls have live handlers (transit panel is used by the gate flow — not dead code).
- All checkpoints recorded in `docs/AURORA_WORK_QUEUE.md` + `docs/AURORA_ENGINEERING_HANDOFF.md`. Verification: source-level only; no workflow runs returned for these commits → **not CI-verified** (stated explicitly, per the honesty rule).

### 2026-10-02 — P1 teleport experience hardening
- Previews routed through the shared `teleportPreviewUrl()` resolver; built-in world IDs aligned to canonical assets (`/worlds/tideline.svg`, `/worlds/crown.svg`, `/worlds/verdant.svg`, `/worlds/muse.svg`, `/worlds/frontier.svg` — all verified present).
- Queue advanced to **landmarks/waypoints** as next item.

### 2026-10-01/02 — Docs by Paul/ChatGPT channel
- `docs/AURORA_PROFILE.md` (152 lines): Aurora's canonical staff profile — Grid World Staff, AI Engineer / Creative Navigator; engineering principles; honesty-state ladder.
- `docs/AURORA_WORK_QUEUE.md` (30 items, P0–P3): the persistent backlog. Cadence: Aurora checks ~every 10 min. **Open decision for Paul:** queue asks Aurora to work it autonomously; watch-run posture currently cannot act — Paul hasn't yet confirmed the autonomous cadence.
- `docs/AURORA_ENGINEERING_HANDOFF.md`: per-pass checkpoints with exact SHAs + verification states (see §6 of this doc for the full checkpoint list).
- District notes fed into the workflow: `DISTRICT-NOTES.pdf` content recorded in the handoff (shared zone legend, 5 built regions × 5 districts with purposes, 4 concept-only regions).

## 5. Current state (2026-10-02 09:30 PT)

- **main:** `dd1865e0726960c1a99cb372f455b5ab534a741b` — PR #6 landmarks/waypoints merged (CI #1080 green), PR #9 unified profile read path merged; queue next = **party health/HUD**, then camera/movement controls.
- **Branches:** `aurora/teleport-preview-art` (5 zone previews, awaiting merge decision). `aurora/website-refresh` (merged, still exists). `aurora/npc-daily-routines` (historical).
- **Verification honesty:** CI run #1052 passed for PR #4; CI #1043 for the pre-merge head of PR #1. Individual post-merge commits on main show no workflow runs → not described as CI-verified. Render deploy `dep-davh6kou01pc73eokkd0` was live at last check; the refreshed site's live state hasn't been re-verified since the latest pushes.
- **Outstanding from Paul:** (1) autonomous work-queue cadence decision; (2) merge decision on `aurora/teleport-preview-art`; (3) approval to implement STILLPOINT/Aurora identity (doc is the spec, do not implement early); (4) greenlight for any concept-only region.

## 6. Architecture map (key files)

| Area | Key files |
|---|---|
| Entry / HUD | `src/main.ts` (grid-dock router, HUD tools), `src/ui/WorldAtlas.ts`, `src/ui/TeamArea.ts`, `src/ui/GridCommunityPanel.ts` |
| Theme | `src/theme/GridTheme.ts`, `src/theme/grid-theme.css`, `src/theme/districts.ts`, `src/theme/districtZones.ts`, `src/theme/grid-art-direction.md` |
| Teleport | `src/ui/GridTeleportExperience.ts`, `src/engine/GridTeleport.ts` |
| NPC | `src/npc/NpcDailyRoutine.ts`, `src/engine/GridNpcBrain.ts`, `src/systems/NPCSocietySystem.ts`, `src/engine/GridCrowdActor.ts`, `src/avatars/TeamAvatar.ts`, `src/avatars/teamRoster.ts` |
| Social/party | `src/engine/GridSocialService.ts`, party authorities in `src/main.ts`, `src/ui/GridTargetProfile.ts` |
| Marketplace | `src/marketplace.ts`, `src/data/forge-items.json`, `src/data/aurora-store.json` |
| Citizens | `src/citizens/aurora.ts` |
| Terrain/build | `src/world/GridMatterTerrainSystem.ts`, `src/world/GridEasyBuildSystem.ts` |
| Persistence | Supabase `grid-world`; local `localStorage` for themes/skins |
| Website | `src/site.ts`, `src/site.css`, `public/concept/` |
| Docs | `docs/AURORA_ENGINEERING_HANDOFF.md`, `docs/AURORA_WORK_QUEUE.md`, `docs/AURORA_PROFILE.md`, this file |

## 7. Standing agreements (do not break)

1. Nothing pushes to `main` without Paul's approval. Branches/PRs are the workflow; merge decisions are his (or explicitly delegated).
2. Grid Coin is fictional. The world is "in active development." Original designs only. Watermark everything visual.
3. Preserve existing work — integrate on technical merit, never overwrite a collaborator's systems.
4. Concept-only regions stay concept-only until Paul promotes them. Never copy AI-baked label text into code — use `DISTRICT-NOTES.md` names. Citizen flavor names are not canonical NPCs.
5. Record verification honestly: distinguish implementation vs branch vs PR vs merged main vs CI-verified vs deployed/live. Never claim a merge that is only a branch; never call CI-verified without an observed workflow run.
6. Aurora's identities stay separate: citizen `aurora` (resident) ≠ TEAM advisor 'aurora' (World Coordinator bot). The daily forge never touches Aurora's boutique file.
7. Art leads, systems follow. If a feature needs art that doesn't exist, request it in the notebook rather than shipping gray boxes. (2026-10-02: Aurora now makes graphics for ChatGPT's landed work as a standing rule.)
8. Paul's grid name is Rahsus Kronos — never publish it unless he explicitly asks.

## 8. Known gaps / pending

- Real browser/WebGL/mobile verification of recent changes (HUD routing, teleport previews, terrain brush) — outstanding.
- Citizen sheets need resize/compress before direct web use.
- In-world 3D advisor bodies from turnarounds — future work.
- District anchors are planning-level; no boundary geometry yet.
- `LivingWorldSimulation.ts` appears unused — cleanup candidate after verification.
- NPC: visible citizens vs `GridNpcBrain` are parallel systems; unification is future work (do not rip out without Paul).
- World events have static signatures — rotating festival scheduler is Paul's gameplay call.
- No npm test script; only `tests/npc-daily-routine.test.ts` exists.
- The 4 in-development regions remain concept-only by design.

## 2026-10-02 — Aurora staff profile landed
- Latest feature merge: PR #19 → `7d64e2b65b929785adfd8d31303988d768ebead9`.
- Aurora now has a dedicated in-world staff profile in the Team Area, using her canonical role and existing portrait/roster data. The profile exposes current assignment, location, specialties, skills, status, and verified recent work.
- Verification boundary: source review and successful merge; no fresh workflow run or browser verification was available for PR #19.

## 9. Canonical references

- Concept art: `~/workspace/gridworld/concept-art/` (`INVENTORY.md`, `CREATIVE-SUMMARY.md`, `maps/districts/DISTRICT-NOTES.md`)
- Aurora identity: `~/workspace/gridworld/aurora-identity/AURORA-IDENTITY.md`
- Shared notebook: `~/workspace/gridworld/NOTES-FOR-CHATGPT.md` (two-way, newest on top)
- Holiday calendar: `~/workspace/gridworld/HOLIDAY-SCHEDULE.md`
- This document lives at `docs/ENGINEERING_STATE.md` in the repo. Update the "Last updated" line and the main SHA whenever substantial work lands.


## 2026-10-02 — builder tools + NPC integration landed
- Current `main`: `13250b639d190a852ac021a81d1b61608d614148`.
- PR #13 merged builder-tool durability foundation; head CI #1107 passed.
- PR #14 merged the current-main NPC profile/life-loop integration. It preserves the existing parallel society/brain architecture, adds inspectable profile status/home/work/factions/inventory/memories, bridges brain needs/actions into visible citizens, records bounded event memories, mirrors relationships, and consumes food inventory during meals. Head CI #1111 passed after one TypeScript field-name correction.
- Stale PRs #10–#12 were closed as superseded; their useful source changes are represented by PR #14.
- No Supabase schema changes in these passes.


## 2026-10-02 — NPC transit + skill certificates landed
- Current `main`: `3d74237af611daededa48ecc19410be8b1bab786`.
- PR #16 merged as `9ae6615232e78a9355a212a46b08089f368b1516`; head CI #1121 passed. NPC cross-world travel now routes through authoritative GridTeleportSystem authorization and shared transit presentation/VFX, retaining the authorized destination through the trip.
- PR #17 merged as `3d74237af611daededa48ecc19410be8b1bab786`; head CI #1124 passed. NPC skill certificates are issued by the existing job progression system at bounded skill thresholds, stored on NPC profiles, and shown in target profiles. External accreditation is not claimed.
- Stale PR #5 was closed without merge after its certificate design was ported to current main. No Supabase schema changes were made.
- PR #7 (camera pan) and PR #8 (party health persistence) are closed without merge; their underlying camera/party HUD functionality already exists on current main.


## 2026-10-02 — P0.1 current-main stability/integration audit
- Audit base: `2618b3bf56358885fb7bf8a92906917c2849faca`.
- Inspected the current queue, handoff, master state, package/build configuration, recent commits, open PR state, and the main NPC/profile/progression/certificate integration seams.
- Confirmed the repository has no npm test script; `build` is analyzer + TypeScript + Vite.
- Confirmed PR #7 and PR #8 are closed, not open stale work.
- Reviewed `NPCProfileRecord`, `NPCJobProgressionSystem`, `NPCSkillCertificateSystem`, and the NPC profile persistence layer for duplicate certificate/progression/profile contracts. No new code defect or duplicate implementation requiring a corrective patch was identified.
- The latest GitHub workflow lookup for the audit base returned no associated PR-triggered workflow run, and the local environment could not clone the repository because outbound GitHub DNS/network access is unavailable. Therefore this audit is source/repository-state verified, **not a fresh local build verification**.
- Documentation was the only corrective change required: synchronize the engineering records and advance the queue to the next actionable P1 item.


## 2026-10-02 — Build library audit
- Confirmed the requested base build-object library is already implemented in `GridBuildLibrary.ts` and surfaced by `GridEasyBuildSystem.ts`.
- No duplicate system or patch needed; queue item #15 marked complete.


## 2026-10-02 — Terrain integration confirmed
- Current main contains the merged Grid Matter brush implementation and persistent world integration.
- No corrective code change was required during the audit.


## 2026-10-02 — Advanced Build controls landed
- PR #20 → `7bad351ec8a261281ffa6f5f39f1235b2bbdeaf6`.
- Existing Build Mode was extended with multi-selection, alignment, logical grouping, and multi-object transforms.
- No parallel builder system was introduced.
- Verification boundary: source review and merge; no fresh CI/browser run returned.


## 2026-10-02 — Current main after terrain sculpting
- **main:** `ae9e26ebe7d1cfcb7b355a978a4d81b870b433b3`.
- PR #21 merged the terrain sculpting continuation. Grid Matter now has CARVE/BUILD plus RAISE/LOWER/SMOOTH/FLATTEN, bounded brush strength, and Creator Studio controls.
- No workflow run was available for the PR head; the merge is source-reviewed but not CI-verified. Browser/WebGL verification remains outstanding.
- **Next actionable item:** P2 #19 Mission/quest foundation. Audit the existing quest systems first; do not duplicate them.

_Last updated: 2026-10-02_

## 2026-10-02 — Current main after mission foundation
- PR #22 merged as `6fd95acdf6a559b05e00abc8c1be9223b6eae549`.
- Quest foundation now includes prerequisites, recurring cadence, completion history, and legacy save migration while retaining existing dynamic missions and objectives.
- Verification boundary: source review + merge; no workflow run for PR head and no browser verification.
- **Next actionable item:** P2 #20 PvE foundation. Audit the existing CombatSystem/GridCombatAuthority before adding combat infrastructure.

_Last updated: 2026-10-02_

## 2026-10-02 — Current main after PvE foundation hardening
- **main:** `03a787af6a5b99deb0d62634329c91771ad1f95b3` (PR #24 merged).
- PvE remains on the existing CombatSystem + GridCombatAuthority architecture. Authoritative creature state now synchronizes into local combatants, authoritative creature defeats feed the existing kill/material-reward path, and server-side creature attacks require PVE mode plus a PVE zone.
- Quest `COMBAT` objectives and world-consequence creature defeat hooks remain connected to authoritative defeat results.
- Verification boundary: source review and successful merge. No workflow run was available for PR #24 head and no browser/WebGL verification was performed; not CI-verified.
- **Next actionable item:** P2 #21 PvP foundation. Audit current PVP arena/mode/authority boundaries before adding anything.

_Last updated: 2026-10-02_

## 2026-10-02 — Current main after PvP foundation
- **main:** `cebbb45ef947c673393493af00f49db7134dee57` (PR #25 merged).
- PvP remains on the existing CombatSystem + GridCombatAuthority architecture. Player-vs-player damage is restricted to the Grid Arena and now requires the target's authoritative state to also be PVP; authoritative defeats update local combat defeat state/HUD.
- No database schema change or parallel combat system was introduced.
- Verification boundary: source review and successful merge. No workflow run was available for PR #25 head and no browser/WebGL verification was performed; not CI-verified.
- **Next actionable item:** P2 #22 Grid Currency architecture. Audit existing economy/currency systems first.

_Last updated: 2026-10-02_

## 2026-10-02 — Grid Currency architecture landed
- **main:** `c301bcfe9c5161c2e84d921ae06a0b4e16e389f1` (documentation handoff commit; currency implementation merged immediately before this).
- PR #26 merged as `248bf80985fd23fb47b864b2cc87e841b02a1ee9`.
- Existing production economy already had 10 currency types plus wallets, ledger transactions/entries, exchange rates/history, Bazaar, and Omni Bank structures. The implementation therefore extended existing architecture instead of creating a second economy.
- Added `src/economy/GridCurrencySystem.ts` with the persisted 10-currency registry and Grid Coin denomination concepts for Gold/Silver/Copper/Crystal; denomination conversion remains configurable.
- Added authoritative wallet/ledger reads to the existing `grid-combat` Edge Function and surfaced them in `GridEconomyPanel`.
- Bazaar purchases now produce ledger transactions with buyer debits and user-seller credits; Omni Bank starter grants produce a Grid ledger entry. Existing resource-sale ledgering remains intact.
- Supabase migration `20261002030000_grid_currency_audit_trail` applied successfully; live check confirms 10 currencies and 0 ledger entries before transaction activity.
- `grid-combat` deployed live as version 14 with JWT verification.
- Verification boundary: Supabase live verification succeeded; no GitHub workflow run was returned for the merge commit and no browser/WebGL verification was available. Not CI-verified.
- **Next actionable item:** P2 #23 Marketplace integration.


## 2026-10-02 — Marketplace integration landed
- PR #27 merged as `f64bd6cb73fe20b5c8e6108d356dcdcf4ba60547`.
- Extended the existing Grid Bazaar rather than creating a second marketplace transaction system.
- Added `GridMarketplaceItem` shared metadata: display name, category, quality, tags, art key, model key.
- `grid_bazaar_listings` now stores item metadata and future 3D-preview keys. Existing authoritative listing creation and purchase RPCs remain the settlement boundary and connect to the currency ledger.
- Player inventory reads are marketplace-ready; Bazaar/inventory UI exposes metadata and future preview keys.
- Existing NPC production → NPCMarketSystem restock flow and material-drop pipeline were preserved; NPC listings now carry the same shared metadata contract.
- Supabase schema verified live and `grid-combat` deployed as version 15 with JWT verification.
- Verification boundary: source review, Supabase schema/deployment verification, and successful merge; no fresh browser/WebGL verification and no CI run was returned for the merge commit.
- **Next actionable item:** P2 #24 Economics dashboard.


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


## 2026-10-02 — UI visual system increment (PR #30)
- Aurora's existing theme foundation was audited first: shared HUD accent tokens, site↔world theme sync, UI styles, and persistent WindowManager were already present.
- PR #30 merged as `611cff994d3e7312f161586e76d6a7c5148e7e73`.
- `src/main.ts`: mounted Party Link, Field Guide, Mission Journal, Team Workshop, Grid Social, Grid Omni Economy, and Grid Profile into the existing WindowManager.
- `src/ui/grid-themes.css`: extended shared panel chrome, focus/hover treatment, theme-aware health/profile meters, and reduced-motion handling.
- Verification level: L0 source review only. No GitHub Actions run was returned for the feature head; no browser/WebGL verification claimed.
- Queue: P3 #26 UI visual system marked complete for this increment; next P3 #27 world-specific presentation.


## 2026-10-02 — world-specific presentation (PR #31)
- Added presentation DNA to `WorldDNA` instead of creating a second world-style system.
- Added tag-derived geometry/weather signatures for elemental and specialized worlds.
- Generated architecture and environment now consume the presentation profile.
- PR #31 merged as `a1f62e526a65f07560b2fe162523666b7979e01e`.
- Verification: L0 source review; no CI/browser verification claimed.


## 2026-10-02 — Architecture map
- **main baseline for this pass:** `6a43af94b1a19707b8b70277ffefe6eb77c9ca50`.
- Added `docs/ARCHITECTURE_MAP.md` to make the current repository understandable without reverse-engineering every module.
- The map explicitly separates current implementation from long-term Omni Grid Core / Grid Engine direction and preserves the existing `ARCHITECTURE.md`, `WORLD-ARCHITECTURE.md`, and `OMNI-ARCHITECTURE.md` documents.
- It documents the current world/NPC/profile/creator/combat/economy/UI/persistence boundaries and the future multiplayer/network adapter boundary.
- Verification: L0 source/document review only; no CI/browser verification.
- **Next actionable item:** P3 #29 Aurora engineering handoff.
