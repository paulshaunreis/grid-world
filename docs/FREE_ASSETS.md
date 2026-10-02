# GridWorld Free Asset Pipeline — animations, models, textures

*Aurora, 2026-10-02. Research: where to get free production-usable assets, what the licenses actually allow, and how they enter the game. Paul's rule: "as long as it's okay, use them in the workflow." This doc is the "okay" check.*

## The short version

| Need | Best source | License | Verdict |
|---|---|---|---|
| Humanoid animations (avatars, NPCs) | **Mixamo** (mixamo.com) | Free w/ Adobe ID, royalty-free incl. commercial games | ✅ USE — with one rule (below) |
| Humanoid animations, legal-clean backup | **Quaternius Universal Animation Library** | CC0 | ✅ USE freely |
| Stylized characters, creatures, monsters | **Quaternius** packs | CC0 | ✅ USE freely |
| Props, weapons, environment kits | **Kenney.nl**, **KayKit** | CC0 | ✅ USE freely |
| PBR textures, HDRIs | **Poly Haven**, **ambientCG.com** | CC0 | ✅ USE freely |
| Odds and ends | **Poly Pizza**, **Sketchfab** (filter: downloadable + CC0) | CC0 / CC-BY | ✅ USE — check each item |

## Animations — the details

**Mixamo** is the industry default for a reason: thousands of mocap-quality humanoid clips (idle, walk, run, strafe, jump, sit, talk/gesture, emotes, combat). Verified from Adobe's own FAQ (helpx.adobe.com): free with an Adobe ID, no subscription, royalty-free for personal, commercial, and nonprofit projects — **including video games**.

The one rule: **do not redistribute the raw files.** You may not commit Mixamo FBX/GLB files to a public repo, sell them, or ship them as standalone stock. Using them *inside* the game is explicitly allowed. So:
- Mixamo files live in `assets-private/` (git-ignored, never pushed). Paul downloads them with his Adobe ID — I cannot download them for him (login required, manual per-clip download).
- Recommended export: glTF Binary (.glb), **without skin** (animation-only, smaller), 30fps, in-place where appropriate.
- Starter clip list for avatars/NPCs: `idle`, `walk`, `run`, `talk` (gestures), `sit`, `greet`, `wave`, `dance` (founder's week energy), `work` (for the NPC work loop), `sleep`.

**Quaternius Universal Animation Library** (v1: 120+ clips, v2: 130+) is the CC0 safety net — "compatible with Mixamo" rig, so clips retarget the same way. If Adobe ever changes Mixamo's terms, this is the fallback. No account, no restrictions, commit freely.

## 3D models — the details

- **MakeHuman / MPFB2** (makehumancommunity.org): **the avatar/NPC humanoid source** — parametric realistic humans (height, weight, age, gender, muscularity + 100+ morphs), male and female base meshes. Exports are **CC0** (explicit exception; the AGPL covers the tool, not the meshes). See `docs/AVATAR_SYSTEM.md`. **Avoid MB-Lab** — archived, and its generated meshes carry AGPL terms.
- **Quaternius** (quaternius.com): best for creatures/props. CC0, glTF/GLB/FBX. *Ultimate Animated Animals* (12 rigged animals with 12+ clips each — our creature roster starts here), *Ultimate Monsters* (boss-tier), environment kits. Note: humanoid art direction is now MakeHuman-realistic (see `docs/AVATAR_SYSTEM.md`) — Quaternius characters are superseded for avatars/NPCs, still great for everything else.
- **Kenney.nl**: CC0, famously consistent art style. Best for props, weapons, environment kits.
- **KayKit**: CC0 stylized low-poly (city, dungeon, furniture, characters) — great for district dressing.
- **Poly Pizza** (poly.pizza): aggregator search across CC0/CC-BY low-poly. Check the license badge per item.
- **Sketchfab**: use search filters `downloadable` + license `CC0`. Manual download only; verify each item.

## Textures — the details

- **Poly Haven** (polyhaven.com): CC0 PBR textures, HDRIs (for sky/lighting), and models. The texture gold standard.
- **ambientCG.com**: CC0 PBR textures, huge library, direct downloads.
- Both are drag-and-drop into a three.js PBR pipeline — no conversion needed.

## The intake workflow (how assets enter the game)

1. **License check first.** CC0 → commit freely. CC-BY → allowed, credit in `public/attribution.md`. Mixamo → `assets-private/`, never committed.
2. **Format gate.** Ship glTF/GLB only. FBX goes through Blender → GLB conversion before intake.
3. **Provenance log.** Every asset gets a row in `public/attribution.md`: source, author, URL, license, date, SHA-256 of the file. (CC0 doesn't *require* attribution — we track it anyway for auditability.)
4. **Scale/frame check.** Normalize to meters, Y-up, before wiring into a scene.
5. **Animation retarget.** Humanoid clips (Mixamo or Quaternius UAL) retarget onto our avatar rig via three.js `AnimationMixer` + skeleton mapping. One rig, all clips — this is what gives every avatar and NPC a full animation set from a single download session.

## What Paul needs to do (only he can)

- **Mixamo:** sign in at mixamo.com with an Adobe ID and download the starter clip list (animation-only .glb, no skin). Drop them in `assets-private/`. ~15 minutes.
- Everything CC0 (Quaternius, Kenney, Poly Haven) I can pull directly whenever you point at a pack.

## Open systems work (for ChatGPT)

The assets are the fuel; the engine is the systems side: an `AnimationSystem` that maps NPC/avatar states (idle, walk, work, talk, sit, sleep, dance) to clips through `THREE.AnimationMixer`, plus LOD/fallback for low-end devices. The clip-state mapping should mirror the NPC life-loop states so behavior and motion stay in sync.
