# Playable Races — unlockable peoples of the Grid

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** wide variety of unlockable races with lore; 3D mesh bodies and heads for each race and gender; heads vary; body diversity — including fat avatars for citizens who want them.

## Design law

- **No race is better.** Differences are expressive and cultural, with minor affinities — never stat superiority, never pay-to-win.
- **Unlocks are stories.** Every race is earned through quests, deeds, or mystery — same language as area unlocks. A locked race is a promise.
- **Every body belongs.** G-rated, kind, non-sexualized — always.

## The races

1. **Gridborn (human)** — everyone starts here. The baseline people of First Light. No unlock needed.
2. **Lumen** — light-touched humanoids, faint circuit-tracery under the skin. *Unlock: attune at the World Gate.* Homeland: First Light.
3. **Emberkin** — warm ember-dusk folk, lantern-glow eyes. *Unlock: Emberfall questline.* Homeland: Emberfall.
4. **Verdant** — circuit-jungle symbiotes, copper-vine hair, petal tones. *Unlock: the tuning trials.* Homeland: the Verdant Circuit.
5. **Reefborn** — sky-sailor folk, wind-worn, light-sail tattoos. *Unlock: Shattered Reef exploration.* Homeland: the Shattered Reef.
6. **Ascended** — former creatures who chose personhood through the Rite of Becoming. They remember their creature days. *Unlock: raise a creature to Apex and complete the Rite.* Homeland: wherever they were raised.

Each race gets a lore entry in the Historium and a small cultural footprint (greetings, festivals, craft styles).

## Avatar meshes: bodies and heads

- **Per race × per gender:** a full 3D body mesh and head mesh set. 6 races × 2 genders = 12 body bases minimum.
- **Heads vary:** multiple head sculpts per race/gender — different faces, not one face with sliders. Citizens should recognize each other across the plaza.
- **Body diversity:** build slider from slim to **fat**, height range, posture. Someone who wants a fat avatar gets a fat avatar — handsome, well-made, never a joke. Every build gets the same clothing fits and animations.
- **Feeds the avatar system:** this doc is the content spec; rigging/retargeting implementation belongs to the avatar pipeline (one rig philosophy — see pipeline notes).

## Implementation notes (ChatGPT's lane)

- Race service: per-citizen race, unlock flags (quest/deed/mystery), race-change rules (one free change? earned?).
- Asset pipeline: 12+ body bases, N head sculpts each; LODs; clothing must fit all builds (no clipping on fat bodies — test it).
- Ascension flow: creature record → citizen record handoff, lineage memory preserved, Historium entries linked.
- Affinities: minor, expressive (Emberkin see a touch better at dusk; Reefborn glide a touch longer). Cosmetic-first, never power.

## Open questions for Paul

- More races later (glitch-touched? deep-sea?), or lock the six?
- Race-change: free once, then earned — or always free?
- Should affinities exist at all, or pure cosmetic?

---

## Citizen-created skins & hair (Paul, 2026-10-03)

Citizens don't just wear avatars — they **make** them.

- **Skins:** user-created skin textures and colorways for every race/gender. Paul's standing rule applies: every texture ships in MORE THAN ONE COLOR (VOLT/ACID/MAGMA/VIOLET/GHOST family). Skin submissions go through review (appropriateness + quality, the There.com lesson) before the marketplace.
- **Hair:** user-created hairstyles — mesh + texture. Long, short, wild, neat, ceremonial. Same review, same marketplace.
- **Creators earn:** skin/hair makers get real payouts on sales (the Second Life lesson — creators own their IP and get their cut).
- **Fits guaranteed:** the asset pipeline validates every skin/hair against all 12 body bases and the build slider (slim to fat) — no clipping, no stretching, no exceptions.
