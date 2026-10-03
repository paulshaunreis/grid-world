# The Wilds & Dungeons — randomized areas, keyword addresses

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** randomized areas and dungeons.

## Keyword-addressed wilds (the .hack steal)

Beyond the mapped regions lie the **Wilds** — uncharted areas generated from **three-word keyword plates** at any gate (e.g., "Ember / Hollow / Choir"). Each word shapes the seed: terrain, flora, creature mix, weather. The same words on a different shard give a different wild.

- **~Any combination works.** The grid of possibilities is effectively endless.
- **Good addresses are community currency.** Citizens share wild addresses like fishing spots: "try Verdant / Mirror / Deep — the Choir Stones are huge there."
- **Hidden words** drop through events, quests, and the Historium — rare words grow rare wilds.
- Wilds are **temporary**: they shimmer at the edge of the map for a few days, then dissolve back. Visit, tune, gather — or lose it. (The world stays fresh; the server stays light.)

## Dungeons: the Delves

Beneath cities and wilds: **Delves** — instanced, seeded, randomized dungeons.

- **Three tiers:** **Delve** (gentle, tutorial-adjacent), **Deep** (real challenge, bring friends), **Abyssal** (the Grid's hardest doors — group attunement required, like the Ancient Gates).
- **Seeded layout:** rooms, hazards, puzzles, and creature nests shuffle per run. No two Delves alike; the address + day is the seed, so friends can share a run.
- **Wardens, not bosses:** each Delve ends in a **Warden** — a great creature (often a Choir Stone or Pale Stag) that tests you. Prove yourself — by tuning, by puzzle, by courage — and it yields a gift. Nothing is killed. (G-rated, always.)
- **Modifiers:** glitch-weather, Dim tides, and Crack Days twist Delves — "tonight the Deep runs Thorn."
- **Difficulty is honest:** tiers are labeled, requirements listed, no gotcha zones. A Delve never punishes curiosity.

## Yin-yang in the wilds

Wilds and Delves roll a **Bright/Dim leaning** — it shapes everything: a Bright wild has Lumoths and dawn weather; a Dim wild has Duskmoles and long shadows. Balanced seeds are the rarest and richest. The duality is the dungeon's personality.

## Implementation notes (ChatGPT's lane)

- **Procedural service:** seeded generator (address + day + tier → layout), deterministic so parties share runs; wilds expire and clean up.
- **Keyword registry:** word → seed-bias mapping, hidden-word drops, community address sharing (copyable gate plates).
- **Delve instancing:** per-party instances, Warden encounters as scripted tuning/puzzle events, gift tables.
- **Content budget:** procedural assembly from hand-made room/chunk kits — authored pieces, shuffled smartly (never pure noise).

## Open questions for Paul

- Should Abyssal Delves have real stakes (lose your light, not your life), or stay gentle?
- Leaderboards for Delve clears — or anti-competitive by design?
- Player-built Delves someday (citizen-designed dungeons)?
