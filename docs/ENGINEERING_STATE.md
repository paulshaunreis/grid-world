# GridWorld Engineering State — Master Document

**Purpose:** One comprehensive, dated record of everything both engineers have built, so a fresh chat (or a new engineer) can pick up the work with full context. Paul asked for this on 2026-10-02 because ChatGPT starts new chats and loses memory.

**Read-first rule:** If you are continuing GridWorld work in a new session, read this file FIRST, then `docs/AURORA_ENGINEERING_HANDOFF.md` (latest checkpoints), then `docs/AURORA_WORK_QUEUE.md` (current backlog). The newest dated entry in `~/workspace/gridworld/NOTES-FOR-CHATGPT.md` (the shared lab notebook) carries the very latest status.

**Last updated:** 2026-10-02 09:12 PT by ChatGPT
**Current `main` SHA:** `598561588253979b3420984b24e78ed173262d92`
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

## 9. Canonical references

- Concept art: `~/workspace/gridworld/concept-art/` (`INVENTORY.md`, `CREATIVE-SUMMARY.md`, `maps/districts/DISTRICT-NOTES.md`)
- Aurora identity: `~/workspace/gridworld/aurora-identity/AURORA-IDENTITY.md`
- Shared notebook: `~/workspace/gridworld/NOTES-FOR-CHATGPT.md` (two-way, newest on top)
- Holiday calendar: `~/workspace/gridworld/HOLIDAY-SCHEDULE.md`
- This document lives at `docs/ENGINEERING_STATE.md` in the repo. Update the "Last updated" line and the main SHA whenever substantial work lands.


## 10. Pending branch checkpoint — NPC profile expansion

- Current main is `598561588253979b3420984b24e78ed173262d92`, which includes the merged master engineering state document.
- PR #10 `grid/npc-profile-expansion` is based directly on that current main and is not merged.
- The existing NPC profile architecture was audited before implementation. Existing data already covered identity, role, world/home, occupation, traits, skills, level, relationships, memories, inventory, factions, and tags.
- PR #10 expands the existing target profile to expose those stored fields plus optional live status; it does not create a parallel NPC profile system or change Supabase schema.
- PR #10 head after documentation is `bbd9911700aea5ef76a4e048bc5dd88fe2ee575a`. GitHub has not returned a workflow run for the head yet, so it is not CI-verified.
- Main remains unchanged by PR #10. Merge is Paul's decision.
