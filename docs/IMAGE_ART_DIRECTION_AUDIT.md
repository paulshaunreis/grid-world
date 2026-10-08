# Grid World Image Art-Direction Audit
**Date:** 2026-10-08
**Paul's direction:** All images must share ONE visual art style: photorealistic cinematic, deep blues, cyan accents, dramatic lighting. No mixing styles.

## Target style (KEEP)
Photorealistic cinematic — film-quality detail, natural textures, dramatic lighting.

| Location | Files | Status |
|---|---|---|
| `public/home/*.jpg` (12) | hero-worlds, 6 world cards, inworld-experience, avatar-aurora, build-create, play-connect, stay-connected | ✅ Target style |
| `public/home/items/*.jpg` (24) | item-01…item-24 icons | ✅ Consistent |
| `public/concept/*.webp` (5) | map-firstlight, map-overworld, worldlook-* | ✅ Photorealistic |
| `public/art/*.webp` (8) | hero-worlds, grid-page-atlas, grid-ui-atlas, asset-constellation, foundation, economics-hero, team-studio, combat-system | ✅ Photorealistic |

## CLASH — flag for regeneration
These do NOT match. Regenerate in photorealistic cinematic style.

### 1. Flat vector SVG placeholders (14 files) — HIGHEST PRIORITY
Completely different style (flat vector diagrams). Visible on the live homepage.
- `public/art/combat-system.svg`
- `public/art/creator-studio.svg`
- `public/art/grid-page-atlas.svg`
- `public/art/secure-grid.svg`
- `public/art/team-studio.svg`
- `public/art/worlds-aurora.svg`
- `public/grid-concept-civic.svg`
- `public/grid-concept-first-light.svg`
- `public/grid-concept-living-wilds.svg`
- `public/worlds/crown.svg`
- `public/worlds/frontier.svg`
- `public/worlds/muse.svg`
- `public/worlds/tideline.svg`
- `public/worlds/verdant.svg`

**Note:** `src/site.ts` and `src/theme/districts.ts` currently reference the `.svg` versions. After regeneration as `.webp`/`.jpg`, update those references back.

### 2. Cartoonish world art (5 files)
Stylized mobile-game look — clashes with photorealistic direction.
- `public/worlds/crown.webp`
- `public/worlds/frontier.webp`
- `public/worlds/muse.webp`
- `public/worlds/tideline.webp`
- `public/worlds/verdant.webp`

### 3. Pixar-style team portraits (24 files)
3D-cartoon style — does not match photorealistic bar.
- `public/team/portraits/*.webp` (all 24)

**Decision needed from Paul:** Regenerate all 24 in photorealistic style, or keep the stylized look as a deliberate contrast for team portraits? Currently flagged as clash.

## Regeneration prompt template
> Photorealistic cinematic concept art for Grid World. Deep blue color grading with cyan accents (#4ceaff), dramatic volumetric lighting, film-quality detail, natural textures. [SUBJECT]. Dark atmospheric mood, epic scale. Watermark: © GridWorld bottom-right.

## Pages referencing clash images
- `index.html` (via site.ts): hero, gallery, world cards, combat section
- Any page using `districts.ts` world art
