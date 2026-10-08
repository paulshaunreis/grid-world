# Grid World Image Library
**Single source of truth for all image assets. Created 2026-10-08 per Paul's direction.**
**Total: 123 image files** under `public/`.

> **Paul's art direction (locked):** All images must share ONE visual style —
> **photorealistic cinematic**: film-quality detail, natural textures, dramatic
> lighting, deep blue color grading with cyan accents. No style mixing.
> UI must be grayscale-first with user-selectable color themes (11 styles).
> See `docs/IMAGE_ART_DIRECTION_AUDIT.md` for the clash list.

## Art direction spec (for all new/regenerated images)

- **Style:** Photorealistic cinematic — film-quality detail, natural textures
- **Color grading:** Deep blues (`#06121f`–`#0e1a2a` shadows), cyan accents (`#4ceaff`)
- **Lighting:** Dramatic volumetric, epic scale, dark atmospheric mood
- **Watermark:** `© GridWorld` bottom-right on all large images
- **Honesty:** All concept art labeled `CONCEPT ART` in UI; never presented as live gameplay
- **Regeneration prompt template:**
  > Photorealistic cinematic concept art for Grid World. Deep blue color grading
  > with cyan accents (#4ceaff), dramatic volumetric lighting, film-quality
  > detail, natural textures. [SUBJECT]. Dark atmospheric mood, epic scale.
  > Watermark: © GridWorld bottom-right.

**Status key:** ✅ matches target style · ⚠️ needs regeneration · ❓ needs Paul's decision

---

## `/home/` — Concept homepage (home.html)

| File | Purpose | Used by | Status |
|---|---|---|---|
| `hero-worlds.jpg` | Hero background — floating islands, waterfalls, ringed planet | `src/homepage.ts` | ✅ |
| `world-azure-skies.jpg` | World card: Azure Skies | `src/homepage.ts` | ✅ |
| `world-cyber-district.jpg` | World card: Cyber District | `src/homepage.ts` | ✅ |
| `world-verdant-reach.jpg` | World card: The Verdant Reach | `src/homepage.ts` | ✅ |
| `world-lost-ruins.jpg` | World card: The Lost Ruins | `src/homepage.ts` | ✅ |
| `world-void-frontier.jpg` | World card: Void Frontier | `src/homepage.ts` | ✅ |
| `world-ice-cauldron.jpg` | World card: Ice Cauldron | `src/homepage.ts` | ✅ |
| `inworld-experience.jpg` | In-world experience panel — Crystal Falls vista | `src/homepage.ts` | ✅ |
| `avatar-aurora.jpg` | Aurora profile portrait + in-world HUD avatar | `src/homepage.ts` | ✅ |
| `build-create.jpg` | Build & Create panel — creator dome | `src/homepage.ts` | ✅ |
| `play-connect.jpg` | Play & Connect panel — winged creature rider | `src/homepage.ts` | ✅ |
| `stay-connected.jpg` | Stay Connected panel — devices showing Grid World | `src/homepage.ts` | ✅ |
| `items/item-01.jpg` … `item-24.jpg` | Inventory item icons (24, sliced from icon grids) | `src/homepage.ts` | ✅ |

## `/art/` — Site art

| File | Purpose | Used by | Status |
|---|---|---|---|
| `hero-worlds.webp` | Legacy hero art | `src/site.ts` (×4 refs) | ✅ photorealistic |
| `grid-page-atlas.webp` | Atlas page art | `src/site.ts` | ✅ photorealistic |
| `grid-ui-atlas.webp` | UI atlas reference | (reference) | ✅ photorealistic |
| `asset-constellation.webp` | Asset constellation section | `src/site.ts` | ✅ photorealistic |
| `foundation.webp` | Grid Foundation section | `src/site.ts` | ✅ photorealistic |
| `economics-hero.webp` | Economics page hero | economics page | ✅ photorealistic |
| `team-studio.webp` | Studio live section | `src/site.ts` | ✅ photorealistic |
| `combat-system.webp` | Combat section | `src/site.ts` (was) | ✅ photorealistic |
| `combat-system.svg` | ⚠️ Flat vector placeholder (replaced webp ref) | `src/site.ts` | ⚠️ regenerate |
| `creator-studio.svg` | ⚠️ Flat vector placeholder | (PR #104) | ⚠️ regenerate |
| `grid-page-atlas.svg` | ⚠️ Flat vector placeholder (replaced webp ref) | `src/site.ts` | ⚠️ regenerate |
| `secure-grid.svg` | ⚠️ Flat vector placeholder | (PR #104) | ⚠️ regenerate |
| `team-studio.svg` | ⚠️ Flat vector placeholder (replaced webp ref) | `src/site.ts` | ⚠️ regenerate |
| `worlds-aurora.svg` | ⚠️ Flat vector placeholder | (PR #104) | ⚠️ regenerate |

## `/worlds/` — World cards (districts.ts)

| File | Purpose | Used by | Status |
|---|---|---|---|
| `tideline.webp` … `verdant.webp` (5) | World card art (cartoonish mobile-game style) | legacy refs | ⚠️ regenerate photorealistic |
| `tideline.svg` … `verdant.svg` (5) | ⚠️ Flat vector placeholders (current refs) | `src/theme/districts.ts` | ⚠️ regenerate |

**Note:** `districts.ts` currently points to `.svg` versions. After regeneration, point back to photorealistic `.webp`/`.jpg`.

## `/grid-concept-*.{svg,webp}` — Concept gallery

| File | Purpose | Used by | Status |
|---|---|---|---|
| `grid-concept-first-light.webp` | First Light concept | `src/main.ts` HUD, `src/site.ts` | ✅ photorealistic |
| `grid-concept-living-wilds.webp` | Living Wilds concept | `src/main.ts` HUD | ✅ photorealistic |
| `grid-concept-civic.webp` | Civic concept | `src/main.ts` HUD | ✅ photorealistic |
| `grid-concept-first-light.svg` | ⚠️ Flat vector placeholder | `src/site.ts` | ⚠️ regenerate |
| `grid-concept-living-wilds.svg` | ⚠️ Flat vector placeholder | `src/site.ts` | ⚠️ regenerate |
| `grid-concept-civic.svg` | ⚠️ Flat vector placeholder | `src/site.ts` | ⚠️ regenerate |

## `/concept/` — World look & maps

| File | Purpose | Used by | Status |
|---|---|---|---|
| `map-firstlight.webp` | First Light map | world pages | ✅ |
| `map-overworld.webp` | Overworld map | world pages | ✅ |
| `worldlook-firstlight-street.webp` | Street look | world pages | ✅ |
| `worldlook-interior.webp` | Interior look | world pages | ✅ |
| `worldlook-wilderness.webp` | Wilderness look | world pages | ✅ |

## `/team/portraits/` — Team (24 files)

| File | Purpose | Used by | Status |
|---|---|---|---|
| `*.webp` (24: atlas, aurora, axiom, cipher, civitas, echo, elder, kairox, link, morrow, mosaic, nyxen, orin, praxis, rey, rook, sentinel, seraith, solenne, tessera, umbra, vael, veyr, waypoint) | Team member portraits — Pixar/3D-cartoon style | team/studio pages | ❓ **Paul's call:** regenerate photorealistic or keep stylized as deliberate contrast? |

## `/avatars/` — Avatar system

| File | Purpose | Used by | Status |
|---|---|---|---|
| `concepts/feminine.webp`, `masculine.webp`, `fluid.webp`, `nonbinary.webp` | Avatar body-type concepts | avatar pages | ✅ |
| `stage-baby.webp` … `stage-elder.webp` (8) | Life-stage avatars | avatar pages | ✅ |

## `/textures/` — PBR material library

| File | Purpose | Used by | Status |
|---|---|---|---|
| `tex-fabric.webp`, `tex-foliage.webp`, `tex-ground.webp`, `tex-metal.webp`, `tex-stone.webp`, `tex-technical.webp`, `tex-wood.webp` | Material swatches for builder | builder/creator | ✅ (functional, not art-directed) |

## `/ui/` — UI chrome

| File | Purpose | Used by | Status |
|---|---|---|---|
| `glass-button.webp`, `glass-card.webp`, `glass-nav.webp`, `glass-panel.webp` | Glass UI reference slices | (reference) | ✅ |

## `/world/` — Loading screens

| File | Purpose | Used by | Status |
|---|---|---|---|
| `loading-firstlight.webp`, `loading-interior.webp`, `loading-wilderness.webp` | 3D world loading screens | 3D engine | ✅ |

## `/atlas/` — Maps

| File | Purpose | Used by | Status |
|---|---|---|---|
| `overworld-map.webp` | Overworld atlas map | atlas pages | ✅ |

## Root

| File | Purpose | Used by | Status |
|---|---|---|---|
| `grid-world-logo.svg` | Site logo (vector — correct as SVG) | all pages | ✅ (logo stays vector) |
| `grid-world-pulse-art.webp` | Pulse artwork | pulse section | ✅ |

---

## Regeneration queue (priority order)

1. **14 flat-vector SVGs** (`/art/*.svg`, `/worlds/*.svg`, `/grid-concept-*.svg`) — highest priority, visible on live pages
2. **5 cartoonish world webps** (`/worlds/*.webp`) — after SVGs are replaced
3. **24 team portraits** — pending Paul's decision (regenerate vs. keep stylized)

## Adding new images — checklist

- [ ] Matches photorealistic cinematic style (see spec above)
- [ ] Deep blue grading + cyan accents
- [ ] `© GridWorld` watermark bottom-right (large images)
- [ ] Labeled `CONCEPT ART` in UI where applicable
- [ ] Added to this library with purpose + used-by
- [ ] Optimized for web (webp/jpg, reasonable file size)
- [ ] Responsive: works at 375px–1920px
