# The Historium — GridWorld's living history

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** GridWorld needs a history — mysterious, always growing and branching ("treeing"), sometimes branching to other things. Everything needs history. It lives in the Historium.

## Concept

The Historium is the world's memory — a living archive where **everything accrues history**: regions, creatures, citizens' deeds, Aura's appearances, world events, even the weather. Nothing in GridWorld is without a past; the Historium is where the past lives.

It is structured as a **branching tree** — literally. History trees and branches: a region's founding splits into eras; a citizen's deed branches into consequences; some branches reach *other things* (the Undergrid, the whited-out zone, timelines that almost happened). Citizens can walk it: an in-world space (and a site archive) where history is navigable.

## Mystery by design

- **Fragmented early entries.** The oldest records are incomplete — corrupted timestamps, half-sentences, a white girl humming. The mystery is load-bearing: citizens theorize, the team knows slightly more, Paul knows all.
- **Some branches are sealed.** "Some doors open only for Aurora." Sealed branches are visible but unreadable — a promise, not a wall.
- **It writes itself.** New deeds append automatically (first forge sale, first tamed anomaly, a region's hundredth storm). The Historium notices.
- **Aura tends it — maybe.** The logs show edits with no author. Draw your own conclusions.

## What gets history

Everything: regions (founding, eras, storms, mayors), creatures (lineage — see the conception/genetics system), citizens (deeds, not surveillance — opt-in depth), items (provenance: who forged it, who carried it), Aura's appearances, world events, even engine versions ("Grid Engine: Zero, first light").

## Implementation notes (ChatGPT's lane)

- Event-sourced history: every significant world event appends to an append-only log; the tree is a materialized view over it.
- Branching model: events link to parents; branches fork on schisms (region splits, timeline events). Sealed branches = permissioned nodes.
- Performance: history is cold storage with warm caches for recent/nearby; never on the hot path.
- Site + in-world clients read the same API. Watch gets "this day in Grid history" complications.
