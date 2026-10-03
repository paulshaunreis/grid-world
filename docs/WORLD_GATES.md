# World Gates — the gate tree

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** world-finding like locking into a world in .hack//G.U.'s Chaos Gates. A tree-type setup: World Gate (massive) → Continent Gate → City Gate → etc.

## The tree

Gates are hierarchical — every gate knows its parent and children, like branches:

- **World Gate** — ONE. Massive. The root of the tree, standing at First Light. Inter-world travel: between Grid shards, to the Undergrid, to Aura's whited-out zone (sealed — some doors open only for Aurora). You feel it before you see it.
- **Continent Gates** — one per continent/region. Travel between continents. Grand arches, each with its continent's sigil.
- **City Gates** — one per city. Travel between cities on a continent. Civic architecture — part gate, part landmark.
- **District Portals** — small discs within a city: neighborhoods, venues, markets.
- **Personal Rifts** — citizen-crafted, tuned to their own plot. The leaves of the tree.

A citizen can only lock to a gate at or below a tier they've attuned — you climb the tree by traveling it.

## Locking in (the G.U. mechanic)

Finding a world is **locking in**: the citizen approaches a gate, selects a destination down (or up) the tree, and the gate *locks* — rings align, glyph bands spin up, light converges to a single tone. The lock-on is a moment: a chime, a held breath, then transit. It should feel like the world noticing you, not like a menu.

Shared fiction with creature taming: everything in GridWorld is tuned. Gates lock; creatures attune. One verb family.

## Visual language (shared across tiers)

Concentric rings, glyph bands, a light well at the center. Scale and ornament mark the tier: the World Gate is architecture you walk *through* for a full minute; a district portal is a disc you step across. All cyan-first per the palette; continent sigils carry accent colors.

## Rules

- **Authority:** the world builds World/Continent gates; cities (governance) build City gates; districts petition; citizens craft personal rifts (attuned to their plot only).
- **Cost:** travel within a city is free. City-to-city costs a small GRC fare (goes to gate upkeep). Continent and World transit cost more — distance has weight.
- **Permissions:** gates respect zoning (SAFE/PVE/PVP) — the gate warns before a PVP-side arrival, never surprises. Sealed destinations (Aura's zone) simply don't lock — the rings won't align.
- **Cooldowns:** short, anti-spam only. Travel should feel fluid, not taxed.
- **Discovery:** new gates appear in the gate registry; the Historium records every gate's raising.

## Implementation notes (ChatGPT's lane)

- Gate registry service: tree structure (parent/children), attunement records per citizen, fare ledger.
- Teleport pipeline: lock-in sequence (client anim) → server validates (permissions, fare, zoning) → interest-management handoff → spawn.
- World Gate = shard/instance router; Continent/City = region servers. Design the tree to map onto the eventual region/shard model.
- Personal rifts: citizen-owned endpoints, revocable, plot-bound.

## Open questions for Paul

- Should the World Gate allow travel to *other games/worlds* someday, or Grid-only forever?
- Fare model: flat per tier, or distance-weighted?
- Can cities name and style their own gates, or one civic template?

---

## The Ancient Gates — Seven Wonders of the Grid

**Status:** Concept design. Awaiting Paul's approval.

Not part of the tree. **Older than the tree.** The Ancient Gates were raised by the First Builders before the first citizen ever logged in — back when the Grid was blank white and something small was already there, humming. (Aura knows what they are. She isn't saying.)

Seven monumental gates, one per region, each a Wonder of the Grid: colossal, weathered, half-buried or overgrown — cracked ancient stone fused with dead circuitry that sometimes, impossibly, flickers.

### The Seven

1. **The Sunken Gate** — beneath the light-sea, in drowned marble ruins. Flickers on storm nights.
2. **The Sky Gate** — floating, tethered by chains of light. Dormant for years. Nobody knows what holds it up.
3. **The Ember Gate** — in volcanic glasslands, amber light breathing in its cracks. The friendliest; it hums.
4. **The Verdant Gate** — swallowed by the circuit-jungle, bound in copper vine and flowering servers.
5. **The Silent Gate** — has never opened. No hum, no light. The great mystery. Citizens leave offerings.
6. **The Mirror Gate** — its face shows a shimmer of wherever it leads. The shimmer changes.
7. **The First Gate** — the oldest, at the edge of the known Grid. Some say the First Builders left through it. Some say they'll return.

### Rules (different from the tree)

- **They cannot be built — only found.** No registry, no fares; they predate the system.
- **Most are dormant.** Awakening one is a world event — the whole Grid feels it. (Live-ops tie-in.)
- **Attunement takes a group.** No solo heroes; ancient things open for communities.
- **Destinations are unknown.** The Historium's records are fragmented. The Mirror Gate hints; the Silent Gate says nothing.
- **Sealed by story, never by paywall.** Mystery is the currency here.
- G-rated, wondrous, never frightening. They should feel like standing before the pyramids — small, quiet, amazed.
